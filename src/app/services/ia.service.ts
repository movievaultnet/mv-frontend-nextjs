import { parseJsonSafely } from './http.client';

interface BlogPostDto {
  id: number;
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
  productUrl: string | null;
  filmId: string | null;
  editionId: string | null;
  createdAt: string;
}

interface BlogPostResponseDto {
  data?: BlogPostDto;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

interface BlogPostsResponseDto {
  data?: BlogPostDto[];
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface AIArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  productUrl: string;
  filmId: string | null;
  editionId: string | null;
  model: string;
  generatedAt: string;
  readTime: number;
  tags: string[];
}

const DEFAULT_IA_SERVICE_BASE_URL = '';
const IA_MODEL_LABEL = 'Gemini 2.5 Flash';

function getIaServiceBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_IA_SERVICE_BASE_URL?.trim();
  return configuredBaseUrl || DEFAULT_IA_SERVICE_BASE_URL;
}

function buildIaServiceUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getIaServiceBaseUrl()}${normalizedPath}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function buildTags(article: BlogPostDto) {
  const tags = ['AI Editorial'];

  if (article.editionId) {
    tags.push('Edition Created');
  }

  return tags;
}

function mapArticle(article: BlogPostDto): AIArticle {
  const excerpt = stripHtml(article.content).slice(0, 220).trim();

  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    content: article.content,
    excerpt,
    imageUrl: article.imageUrl ?? '',
    productUrl: article.productUrl ?? '',
    filmId: article.filmId,
    editionId: article.editionId,
    model: IA_MODEL_LABEL,
    generatedAt: article.createdAt,
    readTime: calculateReadTime(article.content),
    tags: buildTags(article),
  };
}

async function fetchIa(path: string) {
  const response = await fetch(buildIaServiceUrl(path), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorMessage =
      (payload as any)?.message ??
      (payload as any)?.error ??
      `IA request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
}

export const iaService = {
  async getArticlesByMovieId(movieId: string): Promise<AIArticle[]> {
    const payload = await fetchIa(`/api/blog/film/${encodeURIComponent(movieId)}`) as BlogPostsResponseDto | null;
    return (payload?.data ?? []).map(mapArticle);
  },

  async getArticleById(id: string): Promise<AIArticle | null> {
    const payload = await fetchIa(`/api/blog/${encodeURIComponent(id)}`) as BlogPostResponseDto | null;
    return payload?.data ? mapArticle(payload.data) : null;
  },

  async getArticleBySlug(slug: string): Promise<AIArticle | null> {
    const payload = await fetchIa(`/api/blog/slug/${encodeURIComponent(slug)}`) as BlogPostResponseDto | null;
    return payload?.data ? mapArticle(payload.data) : null;
  },

  async getAllArticles(): Promise<AIArticle[]> {
    const payload = await fetchIa('/api/blog') as BlogPostsResponseDto | null;
    return (payload?.data ?? []).map(mapArticle);
  },
};
