import { Package2, Pencil, ScanLine, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import type { CollectionItem } from '../services/collection.service';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface CollectionItemCardProps {
  item: CollectionItem;
  onEdit?: (item: CollectionItem) => void;
  onRemove?: (item: CollectionItem) => void;
}

function formatConditionLabel(value: CollectionItem['caseCondition']) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function CollectionItemCard({ item, onEdit, onRemove }: CollectionItemCardProps) {
  const releaseHref = item.releaseSlug ? `/releases/${item.releaseSlug}` : '/catalog';
  const releaseState = item.releaseSlug ? { editionId: item.editionId } : undefined;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex gap-4 p-4">
        <Link to={releaseHref} state={releaseState} className="flex-shrink-0">
          <div className="relative h-40 w-28 overflow-hidden rounded-lg">
            <ImageWithFallback
              src={item.coverPicture}
              alt={item.filmTitle}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link to={releaseHref} state={releaseState}>
                <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                  {item.filmTitle}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.country || 'Unknown country'} | {item.releaseYear || 'Year N/A'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit?.(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => onRemove?.(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{item.format}</Badge>
            {item.packagingType && (
              <Badge variant="outline">
                <Package2 className="mr-1 h-3.5 w-3.5" />
                {item.packagingType}
              </Badge>
            )}
            <Badge variant="outline">Case: {formatConditionLabel(item.caseCondition)}</Badge>
            <Badge variant="outline">Media: {formatConditionLabel(item.mediaCondition)}</Badge>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              <span className="break-all">Edition {item.editionId}</span>
            </div>
            <div>Added {new Date(item.addedAt).toLocaleDateString()}</div>
          </div>

          {item.comments && (
            <p className="line-clamp-2 text-sm italic text-muted-foreground">
              "{item.comments}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
