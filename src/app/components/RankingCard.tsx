import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LeaderboardEntry } from '../services/ranking.service';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RankingCardProps {
  entry: LeaderboardEntry;
  highlight?: boolean;
}

export function RankingCard({ entry, highlight = false }: RankingCardProps) {
  const getTrendIcon = () => {
    if (entry.change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (entry.change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (entry.change > 0) return `+${entry.change}`;
    if (entry.change < 0) return entry.change;
    return '-';
  };

  const getRankColor = () => {
    if (entry.rank === 1) return 'text-yellow-500';
    if (entry.rank === 2) return 'text-gray-400';
    if (entry.rank === 3) return 'text-amber-700';
    return 'text-muted-foreground';
  };

  return (
    <div 
      className={`group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/50 ${
        highlight 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card'
      }`}
    >
      {/* Rank */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-2xl font-bold ${getRankColor()}`}>
          #{entry.rank}
        </span>
        <div className="flex items-center gap-1 text-xs">
          {getTrendIcon()}
          <span className={entry.change > 0 ? 'text-green-500' : entry.change < 0 ? 'text-red-500' : 'text-muted-foreground'}>
            {getTrendText()}
          </span>
        </div>
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 border-2 border-border">
        <AvatarImage src={entry.avatar} alt={entry.username} />
        <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
          {entry.username}
        </h4>
        <p className="text-sm text-muted-foreground">
          {entry.score.toLocaleString()} points
        </p>
      </div>

      {/* Score Bar */}
      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[100px]">
        <span className="text-lg font-semibold">{entry.score.toLocaleString()}</span>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
            style={{ width: `${Math.min((entry.score / 20000) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
