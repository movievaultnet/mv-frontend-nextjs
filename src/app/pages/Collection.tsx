import { useEffect, useState } from 'react';
import { Library, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router';
import {
  collectionService,
  getDefaultCollectionItemFormValues,
  mapCollectionItemDetailToFormValues,
  type CollectionItem,
  type CollectionItemFormValues,
  type CollectionSection,
} from '../services/collection.service';
import { authService } from '../services/auth.service';
import { Navbar } from '../components/Navbar';
import { CollectionItemCard } from '../components/CollectionItemCard';
import { CollectionItemDialog } from '../components/CollectionItemDialog';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export function Collection() {
  const user = authService.getCurrentUser();
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CollectionSection>('all');
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemDialogLoading, setItemDialogLoading] = useState(false);
  const [itemDialogSubmitting, setItemDialogSubmitting] = useState(false);
  const [itemDialogError, setItemDialogError] = useState('');
  const [itemFormValues, setItemFormValues] = useState(getDefaultCollectionItemFormValues());

  useEffect(() => {
    void loadCollection();
  }, [user?.id]);

  const loadCollection = async () => {
    if (!user) {
      setCollection([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const result = await collectionService.getUserCollection();
      setCollection(result.elements);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: CollectionItem) => {
    if (!confirm('Remove this edition from your collection?')) {
      return;
    }

    try {
      await collectionService.removeFromCollection(item.id);
      setCollection((previous) => previous.filter((entry) => entry.id !== item.id));
    } catch (error) {
      console.error('Failed to remove from collection:', error);
    }
  };

  const handleEdit = async (item: CollectionItem) => {
    setEditingItem(item);
    setItemDialogError('');
    setItemDialogLoading(true);
    setIsItemDialogOpen(true);

    try {
      const detail = await collectionService.getCollectionItem(item.id);
      setItemFormValues(mapCollectionItemDetailToFormValues(detail));
    } catch (error) {
      setItemDialogError(error instanceof Error ? error.message : 'Collection item could not be loaded');
      setItemFormValues(getDefaultCollectionItemFormValues());
    } finally {
      setItemDialogLoading(false);
    }
  };

  const handleEditSubmit = async (values: CollectionItemFormValues) => {
    if (!editingItem) {
      return;
    }

    setItemDialogSubmitting(true);
    setItemDialogError('');

    const parsedPrice = values.purchasePrice.trim() ? Number(values.purchasePrice) : undefined;

    try {
      await collectionService.updateCollectionItem({
        id: editingItem.id,
        purchaseDate: values.purchaseDate || undefined,
        purchasePlace: values.purchasePlace || undefined,
        purchasePrice: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        mediaCondition: values.mediaCondition,
        caseCondition: values.caseCondition,
        comments: values.comments || undefined,
      });

      setCollection((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                mediaCondition: values.mediaCondition,
                caseCondition: values.caseCondition,
                comments: values.comments,
              }
            : item,
        ),
      );
      setIsItemDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      setItemDialogError(error instanceof Error ? error.message : 'Collection item could not be updated');
    } finally {
      setItemDialogSubmitting(false);
    }
  };

  const filterBySection = (section: CollectionSection) => {
    if (section === 'all') {
      return collection;
    }

    return collection.filter((item) => item.section === section);
  };

  const filteredCollection = filterBySection(activeTab);

  const stats = {
    total: collection.length,
    uhd4k: collection.filter((item) => item.section === 'uhd-4k').length,
    bluray: collection.filter((item) => item.section === 'bluray').length,
    dvd: collection.filter((item) => item.section === 'dvd').length,
    other: collection.filter((item) => item.section === 'other').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Library className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">My Collection</h1>
                  <p className="mt-1 text-muted-foreground">
                    {stats.total} {stats.total === 1 ? 'edition' : 'editions'} in your vault
                  </p>
                </div>
              </div>

              <Button asChild>
                <Link to="/catalog">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Editions
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">4K</p>
                <p className="mt-1 text-2xl font-bold">{stats.uhd4k}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Blu-ray</p>
                <p className="mt-1 text-2xl font-bold">{stats.bluray}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">DVD / Other</p>
                <p className="mt-1 text-2xl font-bold">{stats.dvd + stats.other}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CollectionSection)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="uhd-4k">4K ({stats.uhd4k})</TabsTrigger>
              <TabsTrigger value="bluray">Blu-ray ({stats.bluray})</TabsTrigger>
              <TabsTrigger value="dvd">DVD ({stats.dvd})</TabsTrigger>
              <TabsTrigger value="other">Other ({stats.other})</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCollection.length > 0 ? (
              <div className="space-y-4">
                {filteredCollection.map((item) => (
                  <CollectionItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Library className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">
                  {activeTab === 'all'
                    ? 'Your collection is empty'
                    : `No ${activeTab.replace('-', ' ')} editions`}
                </h3>
                <p className="mb-4 max-w-md text-muted-foreground">
                  {activeTab === 'all'
                    ? 'Start building your collection by adding editions from the catalog'
                    : `You do not have any editions in the ${activeTab.replace('-', ' ')} section`}
                </p>
                <Button asChild>
                  <Link to="/catalog">
                    <Plus className="mr-2 h-4 w-4" />
                    Browse Catalog
                  </Link>
                </Button>
              </div>
            )}
          </Tabs>
        </div>
      </div>
      <CollectionItemDialog
        open={isItemDialogOpen}
        onOpenChange={(open) => {
          setIsItemDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setItemDialogError('');
            setItemDialogLoading(false);
          }
        }}
        title="Edit Collection Item"
        description="Update the collection metadata stored in mv-film-service for this owned edition."
        submitLabel="Save changes"
        initialValues={itemFormValues}
        onSubmit={handleEditSubmit}
        submitting={itemDialogSubmitting}
        loading={itemDialogLoading}
        error={itemDialogError}
      />
    </>
  );
}

export default Collection;
