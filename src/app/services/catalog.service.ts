import { buildApiUrl } from './api.config';
import { apiFetch, parseJsonSafely } from './http.client';

interface CatalogSearchItemDto {
  id: string;
  film_id: string;
  slug: string;
  film_title: string;
  cover_picture: string | null;
  bar_code: string;
  country: string;
  format: string;
  release_year: number;
  packaging_type: string;
  notes: string;
  searchable_text: string;
  indexed_at: string;
}

interface EditionPictureDto {
  id: string;
  url: string;
  uploadedAt: string;
}

interface EditionReleaseYearDto {
  value: number | string;
  leap: boolean;
}

interface EditionDetailDto {
  id: string;
  film_id: string;
  slug: string;
  barcode: string;
  country: string;
  format: string;
  release_year: EditionReleaseYearDto | number | string | null;
  packaging_type: string;
  verified: boolean;
  cover_picture: string | null;
  notes: string;
  pictures: EditionPictureDto[];
}

interface EditionDetailResponseDto {
  data?: EditionDetailDto;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

interface CatalogSearchResponseDto {
  data: {
    elements: CatalogSearchItemDto[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    prev_page: number | null;
    current_link: string;
    next_link: string | null;
    prev_link: string | null;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

interface TmdbSearchRequest {
  query: string;
  includeAdult: boolean;
  page: number;
}

interface TmdbSearchMovieDto {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TmdbSearchResponseDto {
  data: {
    page: number;
    results: TmdbSearchMovieDto[];
    total_pages: number;
    total_results: number;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface CatalogSearchItem {
  id: string;
  filmId: string;
  slug: string;
  title: string;
  coverPicture: string;
  barCode: string;
  country: string;
  format: string;
  releaseYear: number;
  packagingType: string;
  notes: string;
  searchableText: string;
  indexedAt: string;
}

export interface TmdbSearchMovie {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  posterUrl: string;
  releaseDate: string;
  releaseYear: string;
  rating: number;
}

export interface TmdbSearchResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: TmdbSearchMovie[];
}

export interface EditionPicture {
  id: string;
  url: string;
  uploadedAt: string;
}

export interface EditionDetail {
  id: string;
  filmId: string;
  slug: string;
  barcode: string;
  country: string;
  format: string;
  releaseYear: number;
  packagingType: string;
  verified: boolean;
  coverPictureId: string;
  coverPictureUrl: string;
  notes: string;
  pictures: EditionPicture[];
}

interface CreateFilmRequestDto {
  tmdbId: number;
  title: string;
  description: string;
  releaseYear: number;
  producingCountry: string;
  rating: string;
  poster: string;
}

interface CreateFilmResponseDto {
  data: {
    id: string;
    title: string;
    description: string;
    releaseYear: number;
    producingCountry: string;
    rating: string;
    poster: string;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

interface CreateReleaseRequestDto {
  filmId: string;
  barCode: string;
  country: string;
  format: string;
  releaseYear: number;
  packagingType: string;
  notes: string;
}

interface CreateReleaseResponseDto {
  data?: {
    id?: string;
    editionId?: string;
  };
  id?: string;
  editionId?: string;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

interface UploadEditionPictureResponseDto {
  data?: {
    id?: string;
    pictureId?: string;
  };
  id?: string;
  pictureId?: string;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface CreatedFilm {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  producingCountry: string;
  rating: string;
  poster: string;
}

export interface CreatedRelease {
  id: string;
}

export interface UploadedEditionPicture {
  id: string;
}

export interface CatalogSearchResult {
  elements: CatalogSearchItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_SEARCH_ENDPOINT = '/api/catalog/films/tmdb/search';
const CREATE_FILM_ENDPOINT = '/api/catalog/films';
const CREATE_RELEASE_ENDPOINT = '/api/catalog/edition';
const EDITION_IDENTITY_CACHE_KEY = 'movievault_catalog_edition_identity_cache';

export const PACKAGING_TYPE_OPTIONS = [
  'Amaray',
  'Slipcase',
  'Steelbook',
  'Digipak',
  'Mediabook',
  'Box_set',
] as const;

export const FORMAT_OPTIONS = [
  'DVD',
  'BluRay',
  'UHD_4K',
  'VHS',
  'Laser_Disc',
  'HDDVD',
  'Betamax',
] as const;

function mapCatalogSearchItem(item: CatalogSearchItemDto): CatalogSearchItem {
  return {
    id: item.id,
    filmId: item.film_id,
    slug: item.slug,
    title: item.film_title,
    coverPicture: mapCatalogCoverPicture(item.slug, item.cover_picture),
    barCode: item.bar_code,
    country: item.country,
    format: item.format,
    releaseYear: item.release_year,
    packagingType: item.packaging_type,
    notes: item.notes,
    searchableText: item.searchable_text,
    indexedAt: item.indexed_at,
  };
}

function getEditionIdentityCache() {
  if (typeof window === 'undefined') {
    return {} as Record<string, string>;
  }

  try {
    const rawCache = window.sessionStorage.getItem(EDITION_IDENTITY_CACHE_KEY);
    return rawCache ? JSON.parse(rawCache) as Record<string, string> : {};
  } catch {
    return {};
  }
}

function persistEditionIdentity(slug: string, editionId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedSlug = slug.trim();
  const normalizedEditionId = editionId.trim();

  if (!normalizedSlug || !normalizedEditionId) {
    return;
  }

  const nextCache = {
    ...getEditionIdentityCache(),
    [normalizedSlug]: normalizedEditionId,
  };

  window.sessionStorage.setItem(EDITION_IDENTITY_CACHE_KEY, JSON.stringify(nextCache));
}

function mapCatalogCoverPicture(slug: string, coverPicture: string | null | undefined) {
  const normalizedSlug = slug.trim();
  const normalizedCoverPicture = coverPicture?.trim() ?? '';

  if (!normalizedSlug || !normalizedCoverPicture) {
    return '';
  }

  return buildApiUrl(`/static/images/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(normalizedCoverPicture)}.jpeg`);
}

function mapEditionPictureUrl(slug: string, pictureId: string) {
  const normalizedSlug = slug.trim();
  const normalizedPictureId = pictureId.trim();

  if (!normalizedSlug || !normalizedPictureId) {
    return '';
  }

  return buildApiUrl(`/static/images/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(normalizedPictureId)}.jpeg`);
}

function parseEditionReleaseYear(value: EditionReleaseYearDto | number | string | null | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim();

    if (/^\d{4}$/.test(normalizedValue)) {
      return Number(normalizedValue);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      return Number(normalizedValue.slice(0, 4));
    }
  }

  if (value && typeof value.value === 'number') {
    return value.value;
  }

  if (value && typeof value.value === 'string') {
    const normalizedValue = value.value.trim();

    if (/^\d{4}$/.test(normalizedValue)) {
      return Number(normalizedValue);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      return Number(normalizedValue.slice(0, 4));
    }
  }

  return 0;
}

function mapEditionDetail(item: EditionDetailDto): EditionDetail {
  persistEditionIdentity(item.slug, item.id);

  const pictures = item.pictures.map((picture) => ({
    id: picture.id,
    url: mapEditionPictureUrl(item.slug, picture.id),
    uploadedAt: picture.uploadedAt,
  }));
  const coverPictureId = item.cover_picture?.trim() ?? '';
  const coverPictureUrl =
    pictures.find((picture) => picture.id === coverPictureId)?.url ??
    pictures[0]?.url ??
    '';

  return {
    id: item.id,
    filmId: item.film_id,
    slug: item.slug,
    barcode: item.barcode,
    country: item.country,
    format: item.format,
    releaseYear: parseEditionReleaseYear(item.release_year),
    packagingType: item.packaging_type,
    verified: item.verified,
    coverPictureId,
    coverPictureUrl,
    notes: item.notes,
    pictures,
  };
}

function mapTmdbSearchMovie(movie: TmdbSearchMovieDto): TmdbSearchMovie {
  const normalizedReleaseDate = movie.release_date.trim();
  const releaseYear = /^\d{4}-\d{2}-\d{2}$/.test(normalizedReleaseDate)
    ? normalizedReleaseDate.slice(0, 4)
    : 'TBA';

  return {
    id: String(movie.id),
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '',
    releaseDate: normalizedReleaseDate,
    releaseYear,
    rating: movie.vote_average,
  };
}

function getCreatedReleaseId(payload: CreateReleaseResponseDto | null) {
  return payload?.data?.id ?? payload?.data?.editionId ?? payload?.id ?? payload?.editionId ?? null;
}

function getUploadedEditionPictureId(payload: UploadEditionPictureResponseDto | null) {
  return payload?.data?.id ?? payload?.data?.pictureId ?? payload?.id ?? payload?.pictureId ?? null;
}

export const catalogService = {
  async search(query: string, page: number = 0, size: number = 10): Promise<CatalogSearchResult> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        elements: [],
        page: 0,
        size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        nextPage: null,
        prevPage: null,
      };
    }

    const params = new URLSearchParams({
      query: normalizedQuery,
      page: String(page),
      size: String(size),
    });

    const response = await apiFetch(`/api/catalog/elastic/search?${params.toString()}`, {
      method: 'GET',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseJsonSafely(response) as CatalogSearchResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Catalog search failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!payload?.data?.elements) {
      throw new Error('Invalid catalog search response');
    }

    payload.data.elements.forEach((item) => {
      persistEditionIdentity(item.slug, item.id);
    });

    return {
      elements: payload.data.elements.map(mapCatalogSearchItem),
      page: payload.data.page,
      size: payload.data.size,
      totalElements: payload.data.total_elements,
      totalPages: payload.data.total_pages,
      hasNext: payload.data.has_next,
      hasPrevious: payload.data.has_previous,
      nextPage: payload.data.next_page,
      prevPage: payload.data.prev_page,
    };
  },

  async searchTmdbMovie(query: string, page: number = 1): Promise<TmdbSearchResult> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        page: 1,
        totalPages: 0,
        totalResults: 0,
        results: [],
      };
    }

    const requestBody: TmdbSearchRequest = {
      query: normalizedQuery,
      includeAdult: true,
      page,
    };

    const response = await apiFetch(TMDB_SEARCH_ENDPOINT, {
      method: 'POST',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const payload = await parseJsonSafely(response) as TmdbSearchResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `TMDB search failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!payload?.data?.results) {
      throw new Error('Invalid TMDB search response');
    }

    return {
      page: payload.data.page,
      totalPages: payload.data.total_pages,
      totalResults: payload.data.total_results,
      results: payload.data.results.map(mapTmdbSearchMovie),
    };
  },

  async createFilmFromTmdb(movie: TmdbSearchMovie, producingCountry: string): Promise<CreatedFilm> {
    const requestBody: CreateFilmRequestDto = {
      tmdbId: movie.tmdbId,
      title: movie.title,
      description: movie.overview,
      releaseYear: Number(movie.releaseYear) || 0,
      producingCountry,
      rating: movie.rating.toFixed(1),
      poster: movie.posterPath ?? '',
    };

    const response = await apiFetch(CREATE_FILM_ENDPOINT, {
      method: 'POST',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const payload = await parseJsonSafely(response) as CreateFilmResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Film creation failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!payload?.data?.id) {
      throw new Error('Invalid film creation response');
    }

    return payload.data;
  },

  async createRelease(request: CreateReleaseRequestDto): Promise<CreatedRelease> {
    const response = await apiFetch(CREATE_RELEASE_ENDPOINT, {
      method: 'POST',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const payload = await parseJsonSafely(response) as CreateReleaseResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Release creation failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const releaseId = getCreatedReleaseId(payload);

    if (!releaseId) {
      throw new Error('Invalid release creation response');
    }

    return {
      id: releaseId,
    };
  },

  async uploadEditionPicture(editionId: string, file: File): Promise<UploadedEditionPicture> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiFetch(`/api/catalog/edition/${editionId}/pictures`, {
      method: 'POST',
      auth: 'required',
      body: formData,
    });

    const payload = await parseJsonSafely(response) as UploadEditionPictureResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Edition picture upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const pictureId = getUploadedEditionPictureId(payload);

    if (!pictureId) {
      throw new Error('Invalid edition picture upload response');
    }

    return {
      id: pictureId,
    };
  },

  async setEditionCoverPicture(editionId: string, pictureId: string): Promise<void> {
    const response = await apiFetch(`/api/catalog/edition/${editionId}/cover/${pictureId}`, {
      method: 'PUT',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Edition cover assignment failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
  },

  getEditionIdBySlug(slug: string): string | null {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return null;
    }

    return getEditionIdentityCache()[normalizedSlug] ?? null;
  },

  rememberEditionIdentity(slug: string, editionId: string): void {
    persistEditionIdentity(slug, editionId);
  },

  async getEditionById(editionId: string): Promise<EditionDetail> {
    const response = await apiFetch(`/api/catalog/edition/${editionId}`, {
      method: 'GET',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseJsonSafely(response) as EditionDetailResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Edition detail failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!payload?.data?.id) {
      throw new Error('Invalid edition detail response');
    }

    return mapEditionDetail(payload.data);
  },
};
