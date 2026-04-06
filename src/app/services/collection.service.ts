import { catalogService, type EditionDetail } from './catalog.service';
import { apiFetch, parseJsonSafely } from './http.client';

export type CollectionCondition =
  | 'Mint'
  | 'NearMint'
  | 'VeryGoodPlus'
  | 'VeryGood'
  | 'GoodPlus'
  | 'Good'
  | 'Fair'
  | 'Poor';

export type CollectionSection = 'all' | 'uhd-4k' | 'bluray' | 'dvd' | 'other';
export const COLLECTION_CONDITION_OPTIONS: readonly CollectionCondition[] = [
  'Mint',
  'NearMint',
  'VeryGoodPlus',
  'VeryGood',
  'GoodPlus',
  'Good',
  'Fair',
  'Poor',
] as const;

interface CollectionItemDto {
  id: string;
  edition_id: string;
  edition_cover_picture?: string | null;
  film_name: string;
  edition_release_year?: {
    value?: number;
  } | null;
  edition_country: string;
  edition_format: string;
  edition_packaging: string;
  item_case_condition: CollectionCondition;
  item_media_condition: CollectionCondition;
  item_comments?: string | null;
  item_added_date: string;
}

interface CollectionListResponseDto {
  data?: {
    elements?: CollectionItemDto[];
    page?: number;
    size?: number;
    total_elements?: number;
    total_pages?: number;
    has_next?: boolean;
    has_previous?: boolean;
    next_page?: number | null;
    prev_page?: number | null;
  };
}

interface CollectionItemResponseDto {
  data?: {
    item_id?: string;
    edition_id?: string;
    purchase_date?: string | null;
    purchase_place?: string | null;
    purchase_price?: number | null;
    media_condition?: CollectionCondition;
    case_condition?: CollectionCondition;
    comments?: string | null;
  };
}

interface CreateCollectionItemResponseDto {
  data?: {
    id?: string;
    created?: boolean;
  };
}

interface UpdateCollectionItemResponseDto {
  data?: {
    id?: string;
    updated?: boolean;
  };
}

interface DeleteCollectionItemResponseDto {
  data?: {
    id?: string;
    deleted?: boolean;
  };
}

export interface CollectionItem {
  id: string;
  editionId: string;
  filmTitle: string;
  releaseSlug: string;
  coverPicture: string;
  releaseYear: number;
  country: string;
  format: string;
  packagingType: string;
  caseCondition: CollectionCondition;
  mediaCondition: CollectionCondition;
  comments: string;
  addedAt: string;
  section: CollectionSection;
}

export interface CollectionListResult {
  elements: CollectionItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CollectionItemDetail {
  id: string;
  editionId: string;
  purchaseDate: string | null;
  purchasePlace: string | null;
  purchasePrice: number | null;
  mediaCondition: CollectionCondition;
  caseCondition: CollectionCondition;
  comments: string;
}

export interface CollectionItemFormValues {
  purchaseDate: string;
  purchasePlace: string;
  purchasePrice: string;
  mediaCondition: CollectionCondition;
  caseCondition: CollectionCondition;
  comments: string;
}

export interface AddToCollectionRequest {
  editionId: string;
  purchaseDate?: string;
  purchasePlace?: string;
  purchasePrice?: number;
  mediaCondition?: CollectionCondition;
  caseCondition?: CollectionCondition;
  comments?: string;
}

export interface UpdateCollectionItemRequest {
  id: string;
  purchaseDate?: string;
  purchasePlace?: string;
  purchasePrice?: number;
  mediaCondition: CollectionCondition;
  caseCondition: CollectionCondition;
  comments?: string;
}

export function getDefaultCollectionItemFormValues(): CollectionItemFormValues {
  return {
    purchaseDate: '',
    purchasePlace: '',
    purchasePrice: '',
    mediaCondition: 'NearMint',
    caseCondition: 'NearMint',
    comments: '',
  };
}

export function mapCollectionItemDetailToFormValues(
  detail: CollectionItemDetail | null,
): CollectionItemFormValues {
  if (!detail) {
    return getDefaultCollectionItemFormValues();
  }

  return {
    purchaseDate: detail.purchaseDate ?? '',
    purchasePlace: detail.purchasePlace ?? '',
    purchasePrice: detail.purchasePrice != null ? String(detail.purchasePrice) : '',
    mediaCondition: detail.mediaCondition,
    caseCondition: detail.caseCondition,
    comments: detail.comments,
  };
}

function getCollectionSection(format: string): CollectionSection {
  switch (format) {
    case 'UHD_4K':
      return 'uhd-4k';
    case 'BluRay':
      return 'bluray';
    case 'DVD':
      return 'dvd';
    default:
      return 'other';
  }
}

function mapCollectionItemDetail(payload: CollectionItemResponseDto | null): CollectionItemDetail | null {
  if (!payload?.data?.item_id || !payload.data.edition_id) {
    return null;
  }

  return {
    id: payload.data.item_id,
    editionId: payload.data.edition_id,
    purchaseDate: payload.data.purchase_date ?? null,
    purchasePlace: payload.data.purchase_place ?? null,
    purchasePrice: payload.data.purchase_price ?? null,
    mediaCondition: payload.data.media_condition ?? 'NearMint',
    caseCondition: payload.data.case_condition ?? 'NearMint',
    comments: payload.data.comments?.trim() ?? '',
  };
}

function buildCollectionMutationPayload(request: AddToCollectionRequest | UpdateCollectionItemRequest) {
  const basePayload = {
    purchase_date: request.purchaseDate ?? null,
    purchase_place: request.purchasePlace?.trim() || null,
    purchase_price: request.purchasePrice ?? null,
    media_condition: request.mediaCondition ?? 'NearMint',
    case_condition: request.caseCondition ?? 'NearMint',
    comments: request.comments?.trim() || null,
  };

  if ('editionId' in request) {
    return {
      edition_id: request.editionId,
      ...basePayload,
    };
  }

  return {
    id: request.id,
    ...basePayload,
  };
}

async function extractPayloadOrError(response: Response, fallbackMessage: string) {
  const payload = await parseJsonSafely(response);

  if (response.ok) {
    return payload;
  }

  const message =
    (payload as Record<string, unknown> | null)?.message ??
    (payload as Record<string, unknown> | null)?.error ??
    fallbackMessage;

  throw new Error(typeof message === 'string' ? message : fallbackMessage);
}

async function getEditionDetailsById(collectionItems: CollectionItemDto[]) {
  const uniqueEditionIds = Array.from(
    new Set(collectionItems.map((item) => item.edition_id).filter(Boolean)),
  );

  const detailEntries = await Promise.all(
    uniqueEditionIds.map(async (editionId) => {
      try {
        const detail = await catalogService.getEditionById(editionId);
        return [editionId, detail] as const;
      } catch {
        return [editionId, null] as const;
      }
    }),
  );

  return new Map(
    detailEntries.filter(
      (entry): entry is readonly [string, EditionDetail] => entry[1] !== null,
    ),
  );
}

function mapCollectionItem(item: CollectionItemDto, editionDetail: EditionDetail | null): CollectionItem {
  return {
    id: item.id,
    editionId: item.edition_id,
    filmTitle: item.film_name,
    releaseSlug: editionDetail?.slug ?? '',
    coverPicture: editionDetail?.coverPictureUrl ?? '',
    releaseYear: item.edition_release_year?.value ?? editionDetail?.releaseYear ?? 0,
    country: item.edition_country,
    format: item.edition_format,
    packagingType: item.edition_packaging,
    caseCondition: item.item_case_condition,
    mediaCondition: item.item_media_condition,
    comments: item.item_comments?.trim() ?? '',
    addedAt: item.item_added_date,
    section: getCollectionSection(item.edition_format),
  };
}

export const collectionService = {
  async getUserCollection(page: number = 0, size: number = 100): Promise<CollectionListResult> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const response = await apiFetch(`/api/catalog/items/collection?${params.toString()}`, {
      method: 'GET',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await extractPayloadOrError(
      response,
      `Collection fetch failed with status ${response.status}`,
    ) as CollectionListResponseDto | null;

    const elements = payload?.data?.elements ?? [];
    const editionDetailsById = await getEditionDetailsById(elements);

    return {
      elements: elements.map((item) =>
        mapCollectionItem(item, editionDetailsById.get(item.edition_id) ?? null),
      ),
      page: payload?.data?.page ?? 0,
      size: payload?.data?.size ?? size,
      totalElements: payload?.data?.total_elements ?? elements.length,
      totalPages: payload?.data?.total_pages ?? 1,
      hasNext: payload?.data?.has_next ?? false,
      hasPrevious: payload?.data?.has_previous ?? false,
      nextPage: payload?.data?.next_page ?? null,
      prevPage: payload?.data?.prev_page ?? null,
    };
  },

  async getCollectionItem(id: string): Promise<CollectionItemDetail | null> {
    const response = await apiFetch(`/api/catalog/items/${id}`, {
      method: 'GET',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await extractPayloadOrError(
      response,
      `Collection item fetch failed with status ${response.status}`,
    ) as CollectionItemResponseDto | null;

    return mapCollectionItemDetail(payload);
  },

  async addToCollection(request: AddToCollectionRequest): Promise<string> {
    const response = await apiFetch('/api/catalog/items', {
      method: 'POST',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildCollectionMutationPayload(request)),
    });

    const payload = await extractPayloadOrError(
      response,
      `Add to collection failed with status ${response.status}`,
    ) as CreateCollectionItemResponseDto | null;

    if (!payload?.data?.id) {
      throw new Error('Invalid add to collection response');
    }

    return payload.data.id;
  },

  async updateCollectionItem(request: UpdateCollectionItemRequest): Promise<void> {
    const response = await apiFetch('/api/catalog/items', {
      method: 'PUT',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildCollectionMutationPayload(request)),
    });

    const payload = await extractPayloadOrError(
      response,
      `Collection update failed with status ${response.status}`,
    ) as UpdateCollectionItemResponseDto | null;

    if (payload?.data?.updated !== true) {
      throw new Error('Invalid collection update response');
    }
  },

  async removeFromCollection(id: string): Promise<void> {
    const response = await apiFetch(`/api/catalog/items/${id}`, {
      method: 'DELETE',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await extractPayloadOrError(
      response,
      `Collection delete failed with status ${response.status}`,
    ) as DeleteCollectionItemResponseDto | null;

    if (payload?.data?.deleted !== true) {
      throw new Error('Invalid collection delete response');
    }
  },

  async isEditionInCollection(editionId: string): Promise<boolean> {
    if (!editionId.trim()) {
      return false;
    }

    const collection = await this.getUserCollection(0, 250);
    return collection.elements.some((item) => item.editionId === editionId);
  },
};
