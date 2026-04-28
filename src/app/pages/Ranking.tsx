import { useEffect, useState } from 'react';
import { Trophy, Loader2, Award, Star } from 'lucide-react';
import { rankingService, type LeaderboardEntry, type UserScore } from '../services/ranking.service';
import { authService } from '../services/auth.service';
import { Navbar } from '../components/Navbar';
import { RankingCard } from '../components/RankingCard';
import { UserBadge } from '../components/UserBadge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';

export function Ranking() {
  const user = authService.getCurrentUser();
  const userId = user?.id || '1';
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankingData();
  }, [userId]);

  const loadRankingData = async () => {
    setLoading(true);
    try {
      const [leaderboardData, scoreData] = await Promise.all([
        rankingService.getLeaderboard(20),
        rankingService.getUserScore(userId)
      ]);
      setLeaderboard(leaderboardData);
      setUserScore(scoreData);
    } catch (error) {
      console.error('Failed to load ranking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const levelProgress = userScore ? rankingService.getNextLevelProgress(userScore.totalScore) : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-[linear-gradient(135deg,rgba(191,163,122,0.28),rgba(246,239,228,0.96)_46%,rgba(239,230,216,1))] dark:bg-[linear-gradient(135deg,rgba(191,163,122,0.14),rgba(38,38,38,0.98)_46%,rgba(20,20,20,1))]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
                <Trophy className="h-8 w-8 text-primary dark:text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Global Leaderboard</h1>
                <p className="text-muted-foreground mt-1">
                  Compete with movie enthusiasts worldwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leaderboard */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-6">Top Rankings</h2>
                {leaderboard.map((entry) => (
                  <RankingCard
                    key={entry.userId}
                    entry={entry}
                    highlight={entry.userId === user?.id}
                  />
                ))}
              </div>

              {/* User Stats */}
              <div className="space-y-6">
                {/* User Score Card */}
                {userScore && (
                  <div className="rounded-xl border border-primary bg-primary/5 p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                        #{userScore.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold">Your Rank</h3>
                        <p className="text-sm text-muted-foreground">
                          Level {userScore.level} Collector
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Stats Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Score</span>
                        <span className="font-semibold">{userScore.totalScore.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Movies Watched</span>
                        <span className="font-semibold">{userScore.moviesWatched}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Reviews Written</span>
                        <span className="font-semibold">{userScore.reviewsWritten}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Level Progress */}
                    {levelProgress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Level Progress</span>
                          <span className="font-medium">
                            Level {levelProgress.current} → {levelProgress.next}
                          </span>
                        </div>
                        <Progress value={levelProgress.percentage} className="h-3" />
                        <p className="text-xs text-muted-foreground text-center">
                          {levelProgress.percentage.toFixed(0)}% complete
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Your Badges</h3>
                  </div>
                  
                  {userScore && userScore.badges.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {userScore.badges.map((badge) => (
                        <UserBadge key={badge.id} badge={badge} unlocked />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No badges earned yet</p>
                    </div>
                  )}
                </div>

                {/* How Points Work */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    How Points Work
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Watch a movie</span>
                      <span className="text-foreground font-medium">+10 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Write a review</span>
                      <span className="text-foreground font-medium">+25 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Add to collection</span>
                      <span className="text-foreground font-medium">+5 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily login</span>
                      <span className="text-foreground font-medium">+2 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Ranking;
