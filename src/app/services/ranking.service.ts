// Ranking Service - User scores and leaderboards

import { getStoredToken, getStoredUser } from './auth.session';
import { apiFetch, parseJsonSafely } from './http.client';

export interface UserScore {
  userId: string;
  username: string;
  avatar?: string;
  totalScore: number;
  level: number;
  moviesWatched: number;
  reviewsWritten: number;
  rank: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number; // Position change from last week
}

interface RankingEnvelope<T> {
  data?: T;
}

interface UserScoreDto {
  user_id: string;
  score: number;
  total_score: number;
  distinct_owned_count: number;
  collection_size: number;
  top_k: number;
  rank?: number | null;
  updated_at?: string | null;
}

interface LeaderboardEntryDto {
  user_id: string;
  score: number;
  rank: number;
}

interface LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  limit: number;
  total_users: number;
}

// Mock badges
const MOCK_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Cinephile',
    description: 'Watch 100 movies',
    icon: '🎬',
    rarity: 'rare'
  },
  {
    id: 'b2',
    name: 'Critic',
    description: 'Write 50 reviews',
    icon: '✍️',
    rarity: 'epic'
  },
  {
    id: 'b3',
    name: 'Early Adopter',
    description: 'Join in the first month',
    icon: '⭐',
    rarity: 'legendary'
  },
  {
    id: 'b4',
    name: 'Genre Master',
    description: 'Complete all genres',
    icon: '🏆',
    rarity: 'epic'
  },
  {
    id: 'b5',
    name: 'Collector',
    description: 'Add 50 movies to collection',
    icon: '📚',
    rarity: 'rare'
  }
];

// Mock leaderboard
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: '1',
    username: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    score: 15240,
    rank: 1,
    change: 2
  },
  {
    userId: '2',
    username: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    score: 14890,
    rank: 2,
    change: -1
  },
  {
    userId: '3',
    username: 'Marcus Reid',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    score: 14125,
    rank: 3,
    change: 1
  },
  {
    userId: '4',
    username: 'Emma Torres',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    score: 13560,
    rank: 4,
    change: -2
  },
  {
    userId: '5',
    username: 'David Park',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    score: 12980,
    rank: 5,
    change: 0
  },
  {
    userId: '6',
    username: 'Lisa Morgan',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
    score: 12450,
    rank: 6,
    change: 3
  },
  {
    userId: '7',
    username: 'Tom Anderson',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    score: 11870,
    rank: 7,
    change: -1
  },
  {
    userId: '8',
    username: 'Nina Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    score: 11230,
    rank: 8,
    change: 2
  }
];

function buildRankingHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function fallbackUsername(userId: string) {
  const currentUser = getStoredUser();
  if (currentUser?.id === userId) {
    return currentUser.name;
  }

  return `User ${userId.slice(0, 8)}`;
}

function mapUserScore(dto: UserScoreDto, requestedUserId: string): UserScore {
  const currentUser = getStoredUser();
  const resolvedUserId = dto.user_id || requestedUserId;
  const totalScore = dto.total_score ?? dto.score ?? 0;

  return {
    userId: resolvedUserId,
    username: currentUser?.id === resolvedUserId ? currentUser.name : fallbackUsername(resolvedUserId),
    avatar: currentUser?.id === resolvedUserId ? currentUser.avatar : undefined,
    totalScore,
    level: rankingService.calculateLevel(totalScore),
    moviesWatched: dto.distinct_owned_count ?? dto.collection_size ?? 0,
    reviewsWritten: 0,
    rank: dto.rank ?? 0,
    badges: []
  };
}

function mapLeaderboardEntry(dto: LeaderboardEntryDto): LeaderboardEntry {
  const currentUser = getStoredUser();

  return {
    userId: dto.user_id,
    username: currentUser?.id === dto.user_id ? currentUser.name : fallbackUsername(dto.user_id),
    avatar: currentUser?.id === dto.user_id ? currentUser.avatar : undefined,
    score: dto.score,
    rank: dto.rank,
    change: 0
  };
}

export const rankingService = {
  async getUserScore(userId: string): Promise<UserScore> {
    const response = await apiFetch(`/api/ranking/users/${userId}/score`, {
      auth: 'required',
      headers: buildRankingHeaders()
    });

    const payload = await parseJsonSafely(response) as RankingEnvelope<UserScoreDto> | null;

    if (!response.ok || !payload?.data) {
      throw new Error(`Failed to load ranking score (${response.status})`);
    }

    return mapUserScore(payload.data, userId);
  },

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiFetch(`/api/ranking/leaderboard?limit=${limit}`, {
      auth: 'required',
      headers: buildRankingHeaders()
    });

    const payload = await parseJsonSafely(response) as RankingEnvelope<LeaderboardResponseDto> | null;

    if (!response.ok || !payload?.data) {
      throw new Error(`Failed to load leaderboard (${response.status})`);
    }

    return payload.data.entries.map(mapLeaderboardEntry);
  },

  async getAllBadges(): Promise<Badge[]> {
    return MOCK_BADGES;
  },

  calculateLevel(score: number): number {
    // Simple level calculation: 1 level per 500 points
    return Math.floor(score / 500) + 1;
  },

  getNextLevelProgress(score: number): { current: number; next: number; percentage: number } {
    const current = this.calculateLevel(score);
    const currentLevelScore = (current - 1) * 500;
    const nextLevelScore = current * 500;
    const progress = score - currentLevelScore;
    const percentage = (progress / 500) * 100;
    
    return {
      current,
      next: current + 1,
      percentage: Math.min(percentage, 100)
    };
  }
};
