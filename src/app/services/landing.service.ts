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
  stats: {
    currentPage: number;
    totalPages: number;
    totalResults: string;
    averageRating: string;
  };
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
    const averageRating =
      movies.reduce((acc, movie) => acc + movie.rating, 0) / Math.max(movies.length, 1);

    return {
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
        currentPage: payload.data.page,
        totalPages: payload.data.total_pages,
        totalResults: payload.data.total_results.toLocaleString('en-US'),
        averageRating: averageRating.toFixed(1),
      },
    };
  },
};
