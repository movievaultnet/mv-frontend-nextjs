import { Star, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import type { Movie } from '../services/film.service';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movie/${movie.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
          <ImageWithFallback
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0 to-background/0 opacity-0 transition-opacity group-hover:opacity-100" />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-border/70 bg-card/92 px-2 py-1 backdrop-blur">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-medium text-foreground">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            <p className="text-sm text-muted-foreground">{movie.director}</p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {movie.genre.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{movie.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{movie.duration}m</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
