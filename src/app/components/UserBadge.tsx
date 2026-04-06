import type { Badge as BadgeType } from '../services/ranking.service';
import { Badge } from './ui/badge';
import { Lock } from 'lucide-react';

interface UserBadgeProps {
  badge: BadgeType;
  unlocked?: boolean;
}

export function UserBadge({ badge, unlocked = false }: UserBadgeProps) {
  const getRarityColor = () => {
    switch (badge.rarity) {
      case 'legendary':
        return 'from-yellow-500 to-orange-500';
      case 'epic':
        return 'from-purple-500 to-pink-500';
      case 'rare':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className={`relative group rounded-xl border p-4 transition-all ${
        unlocked 
          ? 'border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10' 
          : 'border-border/50 bg-card/50 opacity-60'
      }`}
    >
      {/* Lock Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {/* Badge Icon */}
      <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${getRarityColor()} text-3xl`}>
        {badge.icon}
      </div>

      {/* Badge Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold">{badge.name}</h4>
          <Badge 
            variant="outline" 
            className={`text-xs capitalize ${
              badge.rarity === 'legendary' ? 'border-yellow-500 text-yellow-500' :
              badge.rarity === 'epic' ? 'border-purple-500 text-purple-500' :
              badge.rarity === 'rare' ? 'border-blue-500 text-blue-500' :
              'border-gray-500 text-gray-500'
            }`}
          >
            {badge.rarity}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
        {unlocked && badge.unlockedAt && (
          <p className="text-xs text-muted-foreground pt-2">
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
