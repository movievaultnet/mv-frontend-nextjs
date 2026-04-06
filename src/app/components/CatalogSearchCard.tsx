import { Calendar, Package2, ScanLine } from 'lucide-react';
import { Link } from 'react-router';
import type { CatalogSearchItem } from '../services/catalog.service';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CatalogSearchCardProps {
  item: CatalogSearchItem;
}

export function CatalogSearchCard({ item }: CatalogSearchCardProps) {
  return (
    <Link
      to={`/releases/${item.slug}`}
      state={{ editionId: item.id }}
      className="group block"
    >
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
          <ImageWithFallback
            src={item.coverPicture}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.country || 'Unknown country'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {item.format && (
              <Badge variant="secondary" className="text-xs">
                {item.format}
              </Badge>
            )}
            {item.packagingType && (
              <Badge variant="outline" className="text-xs">
                {item.packagingType}
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{item.releaseYear || 'Year N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package2 className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{item.slug}</span>
            </div>
            {item.barCode && (
              <div className="flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{item.barCode}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
