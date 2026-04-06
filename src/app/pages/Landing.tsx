import { Link, useLoaderData } from 'react-router';
import {
  ArrowRight,
  Clapperboard,
  Film,
  Loader2,
  Play,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { buildApiUrl } from '../services/api.config';
import type { LandingCollection, LandingMovie, LandingPayload } from '../services/landing.service';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LandingNavbar } from '../components/LandingNavbar';

function RatingPill({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      {rating.toFixed(1)}
    </div>
  );
}

function PublicMovieTile({ movie }: { movie: LandingMovie }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
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
    const averageRating =
      movies.reduce((acc: number, movie: any) => acc + movie.rating, 0) / Math.max(movies.length, 1);

    const payload = {
      heroMovies: movies.slice(0, 4),
      spotlightMovies: movies.slice(0, 2),
      collections: [
        {
          id: 'discover-grid',
          title: 'Discover Feed',
          description: 'The first page of the TMDB discover feed, sorted by popularity.',
          movies: movies.slice(0, 6),
        },
        {
          id: 'fresh-picks',
          title: 'Fresh Picks',
          description: 'A tighter subset for the editorial part of the landing.',
          movies: movies.slice(2, 6),
        },
        {
          id: 'worth-a-look',
          title: 'Worth A Look',
          description: 'Additional titles surfaced from the same discover request.',
          movies: movies.slice(6, 10),
        },
      ],
      stats: {
        currentPage: payloadRaw.data.page,
        totalPages: payloadRaw.data.total_pages,
        totalResults: payloadRaw.data.total_results.toLocaleString('en-US'),
        averageRating: averageRating.toFixed(1),
      },
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
            The TMDB discover feed could not be loaded from the backend. Try refreshing or open the app directly.
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
      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(193,18,31,0.22),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(140,106,67,0.16),transparent_20%),linear-gradient(180deg,rgba(20,20,22,1),rgba(9,9,10,1))]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
        
        <LandingNavbar />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-12">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Your personal cinema universe
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Track, discover, and vault your favorite movies.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Join a community of cinema enthusiasts. Our live discover feed brings you the latest titles, trending releases, and hidden gems so you're always in the loop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
                <p className="text-sm text-muted-foreground">Current page</p>
                <p className="mt-2 text-3xl font-bold">{payload.stats.currentPage}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
                <p className="text-sm text-muted-foreground">Total pages</p>
                <p className="mt-2 text-3xl font-bold">{payload.stats.totalPages}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
                <p className="text-sm text-muted-foreground">Total results</p>
                <p className="mt-2 text-3xl font-bold">{payload.stats.totalResults}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
                <p className="text-sm text-muted-foreground">Avg. rating</p>
                <p className="mt-2 text-3xl font-bold">{payload.stats.averageRating}</p>
              </div>
            </div>
          </section>

          <section className="relative h-fit w-full max-w-2xl justify-self-center rounded-[2rem] border border-border bg-card/70 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6 lg:justify-self-end">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Featured</p>
                <h2 className="text-2xl font-bold">Trending this week</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Sorted by popularity.desc
              </div>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {payload.heroMovies.map((movie) => (
                  <CarouselItem key={movie.id}>
                    <article className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary/30 p-5 sm:p-6">
                      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card">
                          <div className="relative aspect-[3/4]">
                            <ImageWithFallback
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute right-4 top-4">
                              <RatingPill rating={movie.rating} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">
                              TMDB Discover
                            </Badge>
                            <Badge variant="outline" className="rounded-full">
                              Release {movie.releaseYear}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="text-3xl font-bold sm:text-4xl">{movie.title}</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                              {movie.synopsis}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>Release date: {movie.releaseDate || 'TBA'}</span>
                            <span>TMDB score: {movie.rating.toFixed(1)}</span>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button asChild>
                              <Link to={isAuthenticated ? '/catalog' : '/login'}>
                                {isAuthenticated ? 'Open catalog' : 'Sign in to explore'}
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link to={isAuthenticated ? '/home' : '/register'}>
                                {isAuthenticated ? 'Go to dashboard' : 'Create account'}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-black/70 disabled:opacity-40" />
              <CarouselNext className="right-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-black/70 disabled:opacity-40" />
            </Carousel>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border bg-card p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Spotlight</p>
                <h2 className="text-2xl font-bold">A tighter discover cut</h2>
              </div>
            </div>
            <p className="max-w-xl text-muted-foreground">
              The landing now uses the backend discover response directly and reshapes it into a public-facing showcase without inventing fields that the endpoint does not provide.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {payload.spotlightMovies.map((movie) => (
              <PublicMovieTile key={`spotlight-${movie.id}`} movie={movie} />
            ))}
          </div>
        </section>

        {payload.collections.map((collection) => (
          <CollectionStrip key={collection.id} collection={collection} isAuthenticated={isAuthenticated} />
        ))}

        <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Ready to go further</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The entry page now reflects real backend content.</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Login, catalog, rankings and collection management can now sit behind a landing that is backed by live discover results instead of local placeholder content.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to={isAuthenticated ? '/home' : '/login'}>
                  <Play className="h-4 w-4" />
                  {isAuthenticated ? 'Open the app' : 'Enter MovieVault'}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to={isAuthenticated ? '/ranking' : '/register'}>See what is inside</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


