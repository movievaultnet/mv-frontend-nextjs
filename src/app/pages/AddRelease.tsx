import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, Loader2, PlusCircle, Search, Upload } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  catalogService,
  FORMAT_OPTIONS,
  PACKAGING_TYPE_OPTIONS,
  type TmdbSearchMovie,
} from '../services/catalog.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

interface ReleaseDraft {
  barCode: string;
  country: string;
  format: string;
  releaseYear: string;
  packagingType: string;
  notes: string;
}

interface SelectedEditionImage {
  id: string;
  file: File;
  previewUrl: string;
}

const EMPTY_RELEASE_DRAFT: ReleaseDraft = {
  barCode: '',
  country: '',
  format: '',
  releaseYear: '',
  packagingType: '',
  notes: '',
};

function normalizeCountry(value: string) {
  return value.trim().toUpperCase();
}

function parseReleaseYear(value: string) {
  const normalizedYear = value.trim();

  if (!/^\d{4}$/.test(normalizedYear)) {
    return null;
  }

  return Number(normalizedYear);
}

function getEditionImageId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(file: File) {
  return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
}

export function AddRelease() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TmdbSearchMovie | null>(null);
  const [hasTyped, setHasTyped] = useState(false);
  const [releaseDraft, setReleaseDraft] = useState<ReleaseDraft>(EMPTY_RELEASE_DRAFT);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedEditionImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [pendingPictureEditionId, setPendingPictureEditionId] = useState<string | null>(null);
  const [uploadedPictureIdsByImage, setUploadedPictureIdsByImage] = useState<Record<string, string>>({});
  const [pictureUploadLoading, setPictureUploadLoading] = useState(false);
  const requestCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const selectedImagesRef = useRef<SelectedEditionImage[]>([]);

  useEffect(() => {
    const currentRequest = ++requestCounter.current;
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError('');
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError('');

    const timerId = window.setTimeout(async () => {
      try {
        const response = await catalogService.searchTmdbMovie(normalizedQuery, 1);
        if (requestCounter.current !== currentRequest) {
          return;
        }

        setResults(response.results);
        setIsOpen(true);
      } catch (searchError) {
        if (requestCounter.current !== currentRequest) {
          return;
        }

        setResults([]);
        setError(searchError instanceof Error ? searchError.message : 'Movie search failed');
      } finally {
        if (requestCounter.current === currentRequest) {
          setLoading(false);
        }
      }
    }, 320);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  const handleSelectMovie = (movie: TmdbSearchMovie) => {
    setSelectedMovie(movie);
    setQuery(movie.title);
    setIsOpen(false);
    setSubmitError('');
    setSubmitSuccess('');
    setReleaseDraft({
      ...EMPTY_RELEASE_DRAFT,
      releaseYear: movie.releaseYear !== 'TBA' ? movie.releaseYear : '',
    });
  };

  const handleImageSelection = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) {
      return;
    }

    if (pendingPictureEditionId) {
      setSubmitError('Retry the pending picture processing before modifying the selected images');
      return;
    }

    const nextFiles = Array.from(files);
    const invalidFile = nextFiles.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      setSubmitError('Select only valid image files before creating the release');
      return;
    }

    const existingImageIds = new Set(selectedImages.map((image) => image.id));
    const newImages = nextFiles
      .map((file) => ({
        id: getEditionImageId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      .filter((image) => {
        if (existingImageIds.has(image.id)) {
          URL.revokeObjectURL(image.previewUrl);
          return false;
        }

        return true;
      });

    if (newImages.length === 0) {
      return;
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
    setCoverImageId((prev) => prev ?? newImages[0].id);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const resetImageSelection = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setSelectedImages([]);
    setCoverImageId(null);
    setPendingPictureEditionId(null);
    setUploadedPictureIdsByImage({});

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeSelectedImage = (imageId: string) => {
    if (pendingPictureEditionId) {
      setSubmitError('Retry the pending picture processing before removing images');
      return;
    }

    setSelectedImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      const nextImages = prev.filter((image) => image.id !== imageId);
      setCoverImageId((currentCoverId) => {
        if (currentCoverId !== imageId) {
          return currentCoverId;
        }

        return nextImages[0]?.id ?? null;
      });

      return nextImages;
    });
  };

  const uploadEditionPictures = async (editionId: string, images: SelectedEditionImage[], selectedCoverImageId: string) => {
    setPictureUploadLoading(true);

    try {
      const uploadedPictureIds = { ...uploadedPictureIdsByImage };

      for (const image of images) {
        if (uploadedPictureIds[image.id]) {
          continue;
        }

        const uploadedPicture = await catalogService.uploadEditionPicture(editionId, image.file);
        uploadedPictureIds[image.id] = uploadedPicture.id;
        setUploadedPictureIdsByImage({ ...uploadedPictureIds });
      }

      const coverPictureId = uploadedPictureIds[selectedCoverImageId];

      if (!coverPictureId) {
        throw new Error('The selected cover image could not be uploaded');
      }

      await catalogService.setEditionCoverPicture(editionId, coverPictureId);
      setUploadedPictureIdsByImage({});
      setPendingPictureEditionId(null);
    } finally {
      setPictureUploadLoading(false);
    }
  };

  const handleDraftChange = (key: keyof ReleaseDraft, value: string) => {
    setReleaseDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovie) {
      setSubmitError('Select a film before creating the release');
      return;
    }

    const normalizedBarCode = releaseDraft.barCode.trim();
    const normalizedCountry = normalizeCountry(releaseDraft.country);
    const parsedReleaseYear = parseReleaseYear(releaseDraft.releaseYear);

    if (!normalizedBarCode || !normalizedCountry || !releaseDraft.format || !releaseDraft.packagingType || !parsedReleaseYear) {
      setSubmitError('Complete all required release fields before continuing');
      return;
    }

    if (selectedImages.length === 0 || !coverImageId) {
      setSubmitError('Add one or more images and choose which one should be the cover before creating the release');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');
    setPendingPictureEditionId(null);
    setUploadedPictureIdsByImage({});

    let releaseCreated = false;

    try {
      const createdFilm = await catalogService.createFilmFromTmdb(selectedMovie, normalizedCountry);
      const createdRelease = await catalogService.createRelease({
        filmId: createdFilm.id,
        barCode: normalizedBarCode,
        country: normalizedCountry,
        format: releaseDraft.format,
        releaseYear: parsedReleaseYear,
        packagingType: releaseDraft.packagingType,
        notes: releaseDraft.notes.trim(),
      });
      releaseCreated = true;
      setPendingPictureEditionId(createdRelease.id);
      await uploadEditionPictures(createdRelease.id, selectedImages, coverImageId);

      setSubmitSuccess(`Release created successfully for "${selectedMovie.title}", all pictures uploaded, and cover assigned`);
      setReleaseDraft({
        ...EMPTY_RELEASE_DRAFT,
        releaseYear: selectedMovie.releaseYear !== 'TBA' ? selectedMovie.releaseYear : '',
      });
      resetImageSelection();
    } catch (creationError) {
      if (releaseCreated) {
        setSubmitError(creationError instanceof Error ? creationError.message : 'Picture processing failed after the release was created');
      } else {
        setSubmitError(creationError instanceof Error ? creationError.message : 'Release creation failed');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRetryPictureUpload = async () => {
    if (!pendingPictureEditionId || selectedImages.length === 0 || !coverImageId) {
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');

    try {
      await uploadEditionPictures(pendingPictureEditionId, selectedImages, coverImageId);
      setSubmitSuccess('Edition pictures uploaded successfully and cover assigned');
      resetImageSelection();
    } catch (uploadError) {
      setSubmitError(uploadError instanceof Error ? uploadError.message : 'Edition picture processing failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <PlusCircle className="h-4 w-4" />
                Add release workflow
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add a new release</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                  Search the film in TMDB, complete the release metadata, then the page will create the film in the backend and immediately attach the release to it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10">
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">1. Search the film</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Type at least two characters. Results are fetched progressively from `/api/catalog/tmdb/search`.
                </p>
              </div>

              <div ref={containerRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHasTyped(true);
                      setIsOpen(true);
                    }}
                    onFocus={() => {
                      if (results.length > 0 || query.trim().length >= 2) {
                        setIsOpen(true);
                      }
                    }}
                    placeholder="Search film title, e.g. Rambo"
                    className="h-12 rounded-xl border-border bg-background pl-12 pr-12"
                  />
                  {loading && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
                </div>

                {isOpen && (query.trim().length >= 2 || error) && (
                  <div className="absolute z-30 mt-2 max-h-96 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/20">
                    <div className="max-h-96 overflow-y-auto p-2">
                      {error ? (
                        <div className="rounded-xl px-4 py-6 text-sm text-destructive">{error}</div>
                      ) : loading && results.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-xl px-4 py-6 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Searching TMDB...
                        </div>
                      ) : results.length > 0 ? (
                        <div className="space-y-2">
                          {results.map((movie) => (
                            <button
                              key={movie.id}
                              type="button"
                              onClick={() => handleSelectMovie(movie)}
                              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent"
                            >
                              <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                <ImageWithFallback
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{movie.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {movie.releaseDate || 'Release date unavailable'} | Rating {movie.rating.toFixed(1)}
                                </p>
                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                  {movie.overview}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : hasTyped ? (
                        <div className="rounded-xl px-4 py-6 text-sm text-muted-foreground">
                          No films found for "{query.trim()}".
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">2. Selected film</h2>
              {selectedMovie ? (
                <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                    <div className="aspect-[3/4]">
                      <ImageWithFallback
                        src={selectedMovie.posterUrl}
                        alt={selectedMovie.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedMovie.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Release date: {selectedMovie.releaseDate || 'TBA'} | Rating {selectedMovie.rating.toFixed(1)}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Film selected
                      </div>
                    </div>

                    <p className="leading-7 text-muted-foreground">{selectedMovie.overview}</p>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                      The backend will create this film idempotently using its TMDB id, then the resulting internal film id will be used to create the release.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
                  Search and choose a film above to continue with the release creation flow.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">3. Release metadata</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete the release information. `filmId` is not editable here because it will come from the backend after the film is created or resolved idempotently.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Barcode</label>
                    <Input
                      value={releaseDraft.barCode}
                      onChange={(e) => handleDraftChange('barCode', e.target.value)}
                      placeholder="e.g. 5050582461234"
                      disabled={!selectedMovie || submitLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={releaseDraft.country}
                      onChange={(e) => handleDraftChange('country', normalizeCountry(e.target.value))}
                      placeholder="e.g. US"
                      disabled={!selectedMovie || submitLoading}
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select
                      value={releaseDraft.format}
                      onValueChange={(value) => handleDraftChange('format', value)}
                      disabled={!selectedMovie || submitLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Packaging type</label>
                    <Select
                      value={releaseDraft.packagingType}
                      onValueChange={(value) => handleDraftChange('packagingType', value)}
                      disabled={!selectedMovie || submitLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a packaging type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGING_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Release year</label>
                    <Input
                      value={releaseDraft.releaseYear}
                      onChange={(e) => handleDraftChange('releaseYear', e.target.value)}
                      placeholder="e.g. 2008"
                      disabled={!selectedMovie || submitLoading}
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={releaseDraft.notes}
                    onChange={(e) => handleDraftChange('notes', e.target.value)}
                    placeholder="Optional release-specific notes"
                    disabled={!selectedMovie || submitLoading}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Edition pictures</label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageSelection(e.target.files)}
                    disabled={!selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!selectedMovie || submitLoading || pictureUploadLoading) {
                        return;
                      }

                      setIsDraggingImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);

                      if (!selectedMovie || submitLoading || pictureUploadLoading) {
                        return;
                      }

                      handleImageSelection(e.dataTransfer.files);
                    }}
                    disabled={!selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                    className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
                      isDraggingImage
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {selectedImages.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-medium">{selectedImages.length} image{selectedImages.length === 1 ? '' : 's'} selected</p>
                        <p className="text-sm text-muted-foreground">
                          Choose the cover below. All images will be uploaded one after another.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-full border border-primary/20 bg-primary/10 p-3 text-primary">
                          {isDraggingImage ? <Upload className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Drag the edition images here or click to choose them</p>
                          <p className="text-sm text-muted-foreground">
                            Add one or more images, then choose which one should become the cover.
                          </p>
                        </div>
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                    >
                      Add images
                    </Button>
                    {selectedImages.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={resetImageSelection}
                        disabled={submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                      >
                        Clear images
                      </Button>
                    )}
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedImages.map((image) => {
                        const isCover = coverImageId === image.id;
                        const alreadyUploaded = !!uploadedPictureIdsByImage[image.id];

                        return (
                          <div
                            key={image.id}
                            className={`rounded-2xl border p-4 transition-colors ${
                              isCover ? 'border-primary bg-primary/5' : 'border-border bg-background/60'
                            }`}
                          >
                            <div className="aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary">
                              <img
                                src={image.previewUrl}
                                alt={image.file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="mt-4 space-y-3">
                              <div className="space-y-1">
                                <p className="truncate font-medium">{image.file.name}</p>
                                <p className="text-sm text-muted-foreground">{formatFileSize(image.file)}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isCover ? 'default' : 'outline'}
                                  onClick={() => setCoverImageId(image.id)}
                                  disabled={submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                                >
                                  {isCover ? 'Cover selected' : 'Set as cover'}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeSelectedImage(image.id)}
                                  disabled={submitLoading || pictureUploadLoading || !!pendingPictureEditionId}
                                >
                                  Remove
                                </Button>
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {alreadyUploaded ? 'Uploaded for this edition' : isCover ? 'Will be assigned as cover' : 'Will be uploaded as an additional image'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {submitSuccess}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background/60 p-4">
                  <p className="text-sm text-muted-foreground">
                    Submit flow: create film from TMDB data, create the release with the returned `filmId`, upload every selected image with the returned `editionId`, then assign the chosen image as the edition cover.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {pendingPictureEditionId && selectedImages.length > 0 && coverImageId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRetryPictureUpload}
                        disabled={submitLoading || pictureUploadLoading}
                      >
                        {pictureUploadLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing images...
                          </>
                        ) : (
                          'Retry picture processing'
                        )}
                      </Button>
                    )}
                    <Button type="submit" disabled={!selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId}>
                      {submitLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating release...
                        </>
                      ) : pictureUploadLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing images...
                          </>
                        ) : (
                          'Create release'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default AddRelease;
