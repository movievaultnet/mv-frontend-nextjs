import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  Globe,
  ImageIcon,
  Loader2,
  Package2,
  Plus,
  ScanLine,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { catalogService, type EditionDetail } from '../services/catalog.service';
import { filmService, type FilmDetail } from '../services/film.service';
import {
  collectionService,
  getDefaultCollectionItemFormValues,
  type CollectionItemFormValues,
} from '../services/collection.service';
import { CollectionItemDialog } from '../components/CollectionItemDialog';

interface ReleaseDetailLocationState {
  editionId?: string;
}

function formatReleaseYear(year: number) {
  return year > 0 ? String(year) : 'Unknown year';
}

function formatEditionValue(value: string) {
  if (!value.trim()) {
    return '';
  }

  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function buildEditionLabel(release: EditionDetail) {
  const primaryParts = [
    formatEditionValue(release.format) || 'Edition',
    formatEditionValue(release.packagingType),
  ].filter(Boolean);

  return primaryParts.join(' / ') || 'Edition Detail';
}

function buildEditionSummary(release: EditionDetail) {
  const parts = [
    release.country || 'Unknown country',
    formatReleaseYear(release.releaseYear),
    release.verified ? 'Verified archive record' : 'Archive record pending verification',
  ];

  return parts.join(' / ');
}

function formatUploadedAt(value: string) {
  if (!value) {
    return 'Unknown upload date';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReleaseDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const location = useLocation();
  const locationState = location.state as ReleaseDetailLocationState | null;
  const [release, setRelease] = useState<EditionDetail | null>(null);
  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemDialogError, setItemDialogError] = useState('');
  const [activePictureId, setActivePictureId] = useState<string>('');
  const [isInCollection, setIsInCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const resolvedEditionId =
    locationState?.editionId?.trim() || catalogService.getEditionIdBySlug(slug);

  useEffect(() => {
    if (locationState?.editionId?.trim()) {
      catalogService.rememberEditionIdentity(slug, locationState.editionId);
    }
  }, [locationState?.editionId, slug]);

  useEffect(() => {
    if (!slug || !resolvedEditionId) {
      setLoading(false);
      setError('The edition id could not be resolved from this slug. Open the release from the catalog search results first.');
      return;
    }

    let active = true;

    const loadRelease = async () => {
      setLoading(true);
      setError('');

      try {
        const [detail, collectionState] = await Promise.all([
          catalogService.getEditionById(resolvedEditionId),
          collectionService.isEditionInCollection(resolvedEditionId),
        ]);

        const filmDetail = detail.filmId
          ? await filmService.getFilmById(detail.filmId)
          : null;

        if (!active) {
          return;
        }

        setRelease(detail);
        setFilm(filmDetail);
        setIsInCollection(collectionState);
        setActivePictureId(detail.coverPictureId || detail.pictures[0]?.id || '');
      } catch (detailError) {
        if (!active) {
          return;
        }

        setError(detailError instanceof Error ? detailError.message : 'Release detail could not be loaded');
        setRelease(null);
        setFilm(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRelease();

    return () => {
      active = false;
    };
  }, [resolvedEditionId, slug]);

  const handleAddToCollection = async (values: CollectionItemFormValues) => {
    if (!release || isInCollection) {
      return;
    }

    setAddingToCollection(true);
    setItemDialogError('');

    const parsedPrice = values.purchasePrice.trim() ? Number(values.purchasePrice) : undefined;

    try {
      await collectionService.addToCollection({
        editionId: release.id,
        purchaseDate: values.purchaseDate || undefined,
        purchasePlace: values.purchasePlace || undefined,
        purchasePrice: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        caseCondition: values.caseCondition,
        mediaCondition: values.mediaCondition,
        comments: values.comments || undefined,
      });
      setIsInCollection(true);
      setIsItemDialogOpen(false);
    } catch (addError) {
      setItemDialogError(addError instanceof Error ? addError.message : 'Release could not be added to the collection');
    } finally {
      setAddingToCollection(false);
    }
  };

  const activePicture =
    release?.pictures.find((picture) => picture.id === activePictureId) ??
    release?.pictures[0] ??
    null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !release) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Release unavailable</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {error || 'This release could not be loaded.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/catalog">Back to catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(193,18,31,0.2),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(140,106,67,0.14),transparent_18%),linear-gradient(180deg,rgba(17,17,19,0.98),rgba(5,5,6,1))] text-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="outline" className="border-white/10 bg-black/30 text-slate-100 hover:bg-black/45">
              <Link to="/catalog">
                <ArrowLeft className="h-4 w-4" />
                Back to catalog
              </Link>
            </Button>

            <div className="flex flex-wrap gap-2">
              <Badge className={release.verified ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200' : 'border-primary/30 bg-primary/15 text-primary-foreground'}>
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                {release.verified ? 'Verified release' : 'Pending verification'}
              </Badge>
            </div>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(193,18,31,0.18),transparent_38%),linear-gradient(180deg,rgba(17,17,19,0.94),rgba(10,10,12,0.94))] p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="border-primary/30 bg-primary/15 text-primary-foreground">
                      {formatEditionValue(release.format) || 'Unknown format'}
                    </Badge>
                    {release.packagingType && (
                      <Badge variant="outline" className="border-white/10 bg-black/30 text-slate-200">
                        <Package2 className="mr-1 h-3.5 w-3.5" />
                        {formatEditionValue(release.packagingType)}
                      </Badge>
                    )}
                    {film?.rating && (
                      <Badge variant="outline" className="border-white/10 bg-black/30 text-slate-200">
                        <Star className="mr-1 h-3.5 w-3.5" />
                        Rated {film.rating}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Release archive</p>
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                      {film?.title || buildEditionLabel(release)}
                    </h1>
                    <p className="text-lg text-slate-300">
                      {buildEditionLabel(release)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                      <span>{film?.producingCountry || release.country || 'Unknown country'}</span>
                      <span>{film?.releaseYear ? String(film.releaseYear) : formatReleaseYear(release.releaseYear)}</span>
                      <span>{release.verified ? 'Verified archive record' : 'Archive record pending verification'}</span>
                    </div>
                  </div>

                  <p className="max-w-3xl text-base leading-7 text-slate-300">
                    {film?.description || 'Archive view for this physical edition, with its gallery, packaging details, barcode, and collection actions in one place.'}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Edition Type</p>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{buildEditionLabel(release)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Edition Country</p>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{release.country || 'Unknown'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Edition Year</p>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{formatReleaseYear(release.releaseYear)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Archive Status</p>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{release.verified ? 'Verified' : 'Pending'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {isInCollection ? (
                      <Button size="lg" disabled className="gap-2">
                        <Check className="h-5 w-5" />
                        Already in collection
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setIsItemDialogOpen(true)} disabled={addingToCollection} className="gap-2">
                        <Plus className="h-5 w-5" />
                        Add edition to collection
                      </Button>
                    )}
                    <Button asChild size="lg" variant="outline" className="border-white/10 bg-black/30 text-slate-100 hover:bg-black/45">
                      <Link to="/collection">Open collection</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(320px,420px)_1fr]">
              <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(193,18,31,0.14),transparent_38%),rgba(10,10,12,0.92)] p-6 lg:border-b-0 lg:border-r">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
                  <div className="aspect-[3/4]">
                    {activePicture ? (
                      <ImageWithFallback
                        src={activePicture.url}
                        alt={film?.title || buildEditionLabel(release)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Image gallery</h2>
                    <span className="text-sm text-slate-400">{release.pictures.length} file{release.pictures.length === 1 ? '' : 's'}</span>
                  </div>

                  {release.pictures.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3">
                      {release.pictures.map((picture) => {
                        const isActive = picture.id === activePicture?.id;

                        return (
                          <button
                            key={picture.id}
                            type="button"
                            onClick={() => setActivePictureId(picture.id)}
                            className={`overflow-hidden rounded-xl border transition ${
                              isActive
                                ? 'border-primary shadow-[0_0_0_1px_rgba(193,18,31,0.7)]'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="aspect-[3/4] bg-black/40">
                              <ImageWithFallback
                                src={picture.url}
                                alt={picture.id}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                      No pictures were attached to this release.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ScanLine className="h-4 w-4" />
                        Barcode
                      </div>
                      <p className="mt-3 break-all text-lg font-semibold text-slate-100">{release.barcode || 'Not available'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Globe className="h-4 w-4" />
                        Edition country
                      </div>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{release.country || 'Unknown'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        Edition year
                      </div>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{formatReleaseYear(release.releaseYear)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <BadgeCheck className="h-4 w-4" />
                        Picture count
                      </div>
                      <p className="mt-3 text-lg font-semibold text-slate-100">{release.pictures.length}</p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Release Notes</h2>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-slate-300">
                        {release.notes ? (
                          <p className="leading-7">{release.notes}</p>
                        ) : (
                          <p className="text-slate-500">No release notes were provided for this edition.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Data Snapshot</h2>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                        <dl className="space-y-4 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-slate-400">Film title</dt>
                            <dd className="text-right font-medium text-slate-100">{film?.title || 'Not available'}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-slate-400">Film year</dt>
                            <dd className="font-medium text-slate-100">
                              {film?.releaseYear ? String(film.releaseYear) : 'Not available'}
                            </dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-slate-400">Producing country</dt>
                            <dd className="font-medium text-slate-100">{film?.producingCountry || 'Not available'}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-slate-400">Rating</dt>
                            <dd className="font-medium text-slate-100">{film?.rating || 'Not available'}</dd>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <dt className="text-slate-400">Verification</dt>
                            <dd className="font-medium text-slate-100">{release.verified ? 'Verified' : 'Not verified'}</dd>
                          </div>
                          {activePicture && (
                            <div className="flex items-start justify-between gap-4">
                              <dt className="text-slate-400">Active picture uploaded</dt>
                              <dd className="text-right font-medium text-slate-100">{formatUploadedAt(activePicture.uploadedAt)}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <CollectionItemDialog
        open={isItemDialogOpen}
        onOpenChange={(open) => {
          setIsItemDialogOpen(open);
          if (!open) {
            setItemDialogError('');
          }
        }}
        title="Add Item To Collection"
        description="Create the collection item using the real fields exposed by mv-film-service for this edition."
        submitLabel="Create item"
        initialValues={getDefaultCollectionItemFormValues()}
        onSubmit={handleAddToCollection}
        submitting={addingToCollection}
        error={itemDialogError}
      />
    </>
  );
}

export default ReleaseDetail;
