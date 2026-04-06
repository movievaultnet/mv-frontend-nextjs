import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  COLLECTION_CONDITION_OPTIONS,
  type CollectionItemFormValues,
} from '../services/collection.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

interface CollectionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues: CollectionItemFormValues;
  onSubmit: (values: CollectionItemFormValues) => Promise<void>;
  submitting?: boolean;
  loading?: boolean;
  error?: string;
}

function formatConditionLabel(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function CollectionItemDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  submitting = false,
  loading = false,
  error = '',
}: CollectionItemDialogProps) {
  const [formValues, setFormValues] = useState<CollectionItemFormValues>(initialValues);

  useEffect(() => {
    if (open) {
      setFormValues(initialValues);
    }
  }, [initialValues, open]);

  const handleChange = <K extends keyof CollectionItemFormValues>(
    key: K,
    value: CollectionItemFormValues[K],
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase date</label>
                <Input
                  type="date"
                  value={formValues.purchaseDate}
                  onChange={(event) => handleChange('purchaseDate', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase price</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="29.99"
                  value={formValues.purchasePrice}
                  onChange={(event) => handleChange('purchasePrice', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase place</label>
              <Input
                placeholder="Amazon, CEX, local store..."
                value={formValues.purchasePlace}
                onChange={(event) => handleChange('purchasePlace', event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Media condition</label>
                <Select
                  value={formValues.mediaCondition}
                  onValueChange={(value) => handleChange('mediaCondition', value as CollectionItemFormValues['mediaCondition'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatConditionLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Case condition</label>
                <Select
                  value={formValues.caseCondition}
                  onValueChange={(value) => handleChange('caseCondition', value as CollectionItemFormValues['caseCondition'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatConditionLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                rows={5}
                placeholder="Limited edition, sealed, with slipcover..."
                value={formValues.comments}
                onChange={(event) => handleChange('comments', event.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
