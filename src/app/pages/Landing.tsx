import { Link, useLoaderData } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { buildApiUrl } from '../services/api.config';
import type { LandingCollection, LandingMovie } from '../services/landing.service';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

function RatingPill({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/90 px-2.5 py-1 text-xs text-foreground shadow-sm backdrop-blur">
      <Star className="h-3 w-3 fill-accent text-accent" />
      {rating.toFixed(1)}
    </div>
  );
}

function PublicMovieTile({ movie }: { movie: LandingMovie }) {
  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-border/80 bg-card/95 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_24px_60px_rgba(20,20,20,0.12)] dark:hover:shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <ImageWithFallback
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-4 top-4">
          <RatingPill rating={movie.rating} />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">{movie.title}</h3>
          <p className="text-sm text-muted-foreground">Released {movie.releaseYear}</p>
        </div>
        <p className="line-clamp-4 text-sm text-muted-foreground">{movie.synopsis}</p>
      </div>
    </article>
  );
}

function getReleaseTimestamp(movie: LandingMovie) {
  if (!movie.releaseDate) {
    return 0;
  }

  const parsedDate = new Date(movie.releaseDate);
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function buildLandingCollections(movies: LandingMovie[]): LandingCollection[] {
  const freshPicks = [...movies]
    .sort((left, right) => getReleaseTimestamp(right) - getReleaseTimestamp(left) || right.rating - left.rating)
    .slice(0, 4);

  const freshPickIds = new Set(freshPicks.map((movie) => movie.id));
  const worthALook = [...movies]
    .filter((movie) => !freshPickIds.has(movie.id))
    .sort((left, right) => right.rating - left.rating || getReleaseTimestamp(right) - getReleaseTimestamp(left))
    .slice(0, 4);

  return [
    {
      id: 'discover-grid',
      title: 'Discover Feed',
      description: 'A broad look at the films currently surfacing in discovery.',
      movies: movies.slice(0, 6),
    },
    {
      id: 'fresh-picks',
      title: 'Fresh Picks',
      description: 'Recent titles worth keeping an eye on.',
      movies: freshPicks,
    },
    {
      id: 'worth-a-look',
      title: 'Worth A Look',
      description: 'Standout films selected for their strong reception.',
      movies: worthALook,
    },
  ];
}

function CollectionStrip({
  collection,
  isAuthenticated,
}: {
  collection: LandingCollection;
  isAuthenticated: boolean;
}) {
  if (collection.movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{collection.title}</h2>
          <p className="mt-1 text-muted-foreground">{collection.description}</p>
        </div>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link to={isAuthenticated ? '/catalog' : '/login'}>
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {collection.movies.map((movie) => (
          <PublicMovieTile key={`${collection.id}-${movie.id}`} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export const loader = async () => {
  try {
    const DISCOVER_FILMS_ENDPOINT = '/api/catalog/films/tmdb/discover';
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    const response = await fetch(buildApiUrl(DISCOVER_FILMS_ENDPOINT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeAdult: false,
        includeVideo: false,
        language: 'en-US',
        page: 1,
        sortBy: 'popularity.desc',
      }),
    });

    if (!response.ok) {
      throw new Error(`Discover request failed with status ${response.status}`);
    }

    const payloadRaw = await response.json();
    const results = payloadRaw.data.results;

    const mapLandingMovie = (movie: any) => ({
      id: String(movie.id),
      title: movie.title,
      synopsis: movie.overview,
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '',
      releaseDate: movie.release_date,
      releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : 'TBA',
      rating: movie.vote_average,
      trailerKey: movie.trailer_key,
    });

    const movies = results.map(mapLandingMovie);
    const payload = {
      heroMovies: movies.slice(0, 4),
      spotlightMovies: movies.slice(0, 2),
      collections: buildLandingCollections(movies),
    };

    return { payload, error: null };
  } catch (error) {
    console.error('Failed to load landing payload:', error);
    return { payload: null, error: 'Failed to load landing payload' };
  }
};

export default function Landing() {
  const { payload, error: loaderError } = useLoaderData<typeof loader>();
  const isAuthenticated = authService.isAuthenticated();

  if (loaderError || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Landing unavailable</h1>
          <p className="mt-3 text-muted-foreground">
            This page could not be loaded right now. Try refreshing or open the app directly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to={isAuthenticated ? '/home' : '/login'}>Open app</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Retry</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(191,163,122,0.34),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(138,129,120,0.14),transparent_22%),linear-gradient(180deg,rgba(251,245,236,0.96),rgba(239,230,216,0.98))] dark:bg-[radial-gradient(circle_at_top_left,rgba(191,163,122,0.14),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(138,129,120,0.12),transparent_22%),linear-gradient(180deg,rgba(38,38,38,0.98),rgba(20,20,20,1))]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(20,20,20,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.06)_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-20 dark:[background-image:linear-gradient(rgba(239,230,216,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(239,230,216,0.06)_1px,transparent_1px)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        
        <Navbar variant="hero" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <section className="flex min-h-full flex-col justify-center space-y-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-accent/40 bg-accent/20 px-4 py-1.5 text-primary hover:bg-accent/20">
                Discover films
              </Badge>
              <Badge variant="outline" className="rounded-full border-border bg-card/70 px-4 py-1.5 text-muted-foreground">
                Physical editions and collection tracking
              </Badge>
            </div>

            <div className="space-y-6">
              <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl xl:text-7xl">
                Track, discover, and vault your favorite movies.
              </h1>
              <p className="max-w-4xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                Join a community of cinema enthusiasts. Our live discover feed brings you the latest titles, trending releases, and hidden gems so you're always in the loop.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to={isAuthenticated ? '/home' : '/login'}>
                  {isAuthenticated ? 'Enter MovieVault' : 'Sign in to continue'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to={isAuthenticated ? '/catalog' : '/register'}>
                  {isAuthenticated ? 'Browse catalog' : 'Start with a free account'}
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-card/72 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Discover</p>
                <p className="mt-2 text-sm leading-6 text-foreground/82">Browse notable films and uncover new titles to track.</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/72 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catalog</p>
                <p className="mt-2 text-sm leading-6 text-foreground/82">Search releases, inspect editions, and follow archive data.</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/72 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Collect</p>
                <p className="mt-2 text-sm leading-6 text-foreground/82">Track physical items with condition, notes, and ownership details.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {payload.collections.map((collection) => (
          <CollectionStrip key={collection.id} collection={collection} isAuthenticated={isAuthenticated} />
        ))}
      </main>
    </div>
  );
}
