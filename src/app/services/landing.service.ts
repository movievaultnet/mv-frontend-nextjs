import { coreFetch as apiFetch, parseJsonSafely } from './api.client';

export interface DiscoverFilmsRequest {
  includeAdult: boolean;
  includeVideo: boolean;
  language: string;
  page: number;
  sortBy: string;
}

interface DiscoverFilmDto {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  trailer_key: string | null;
}

interface DiscoverFilmsResponse {
  data: {
    page: number;
    results: DiscoverFilmDto[];
    total_pages: number;
    total_results: number;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface LandingMovie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  releaseDate: string;
  releaseYear: string;
  rating: number;
  trailerKey: string | null;
}

export interface LandingCollection {
  id: string;
  title: string;
  description: string;
  movies: LandingMovie[];
}

export interface LandingPayload {
  heroMovies: LandingMovie[];
  spotlightMovies: LandingMovie[];
  collections: LandingCollection[];
}

const DISCOVER_FILMS_ENDPOINT = '/api/catalog/films/tmdb/discover';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const DEFAULT_DISCOVER_REQUEST: DiscoverFilmsRequest = {
  includeAdult: false,
  includeVideo: false,
  language: 'en-US',
  page: 1,
  sortBy: 'popularity.desc',
};

function mapPosterUrl(posterPath: string | null) {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : '';
}

function mapLandingMovie(movie: DiscoverFilmDto): LandingMovie {
  return {
    id: String(movie.id),
    title: movie.title,
    synopsis: movie.overview,
    posterUrl: mapPosterUrl(movie.poster_path),
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : 'TBA',
    rating: movie.vote_average,
    trailerKey: movie.trailer_key,
  };
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
      description: 'The first page of the TMDB discover feed, sorted by popularity.',
      movies: movies.slice(0, 6),
    },
    {
      id: 'fresh-picks',
      title: 'Fresh Picks',
      description: 'The most recent releases from the current discover feed.',
      movies: freshPicks,
    },
    {
      id: 'worth-a-look',
      title: 'Worth A Look',
      description: 'The strongest-rated titles from the same feed, excluding the fresh picks.',
      movies: worthALook,
    },
  ];
}

async function fetchDiscoverFilms(request: DiscoverFilmsRequest = DEFAULT_DISCOVER_REQUEST) {
  const response = await apiFetch(DISCOVER_FILMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const payload = await parseJsonSafely(response) as DiscoverFilmsResponse | null;

  if (!response.ok) {
    const errorMessage =
      (payload as any)?.message ??
      (payload as any)?.error ??
      `Discover request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (!payload?.data?.results) {
    throw new Error('Invalid discover response');
  }

  return payload;
}

export const landingService = {
  async getDiscoverMovies(request: Partial<DiscoverFilmsRequest> = {}): Promise<LandingMovie[]> {
    const payload = await fetchDiscoverFilms({
      ...DEFAULT_DISCOVER_REQUEST,
      ...request,
    });

    return payload.data.results.map(mapLandingMovie);
  },

  async getLandingPayload(): Promise<LandingPayload> {
    const payload = await fetchDiscoverFilms(DEFAULT_DISCOVER_REQUEST);

    const movies = payload.data.results.map(mapLandingMovie);

    return {
      heroMovies: movies.slice(0, 4),
      spotlightMovies: movies.slice(0, 2),
      collections: buildLandingCollections(movies),
    };
  },
};
