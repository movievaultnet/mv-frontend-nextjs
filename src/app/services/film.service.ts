import { apiFetch, parseJsonSafely } from './http.client';

// Film Service - Movie catalog and search

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  director: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  rating: number;
  duration: number;
  popularity: number;
  cast: string[];
}

interface FilmDetailDto {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  producingCountry: string;
  rating: string;
  poster: string;
}

interface FilmDetailResponseDto {
  data?: FilmDetailDto;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface FilmDetail {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  producingCountry: string;
  rating: string;
  poster: string;
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  year?: number;
  minRating?: number;
  sortBy?: 'popularity' | 'rating' | 'year' | 'title';
}

const POSTER_PALETTES = [
  ['#081f3f', '#1d4ed8', '#7dd3fc'],
  ['#2a0b3f', '#7c3aed', '#f0abfc'],
  ['#1a2e05', '#65a30d', '#bef264'],
  ['#3f0d0d', '#dc2626', '#fca5a5'],
  ['#172554', '#0ea5e9', '#fde68a'],
  ['#3b0764', '#db2777', '#f9a8d4'],
  ['#111827', '#f59e0b', '#fef3c7'],
  ['#0f172a', '#14b8a6', '#99f6e4'],
];

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getPalette(seed: string) {
  const index = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % POSTER_PALETTES.length;
  return POSTER_PALETTES[index];
}

function createPoster(title: string, year: number, genre: string[]) {
  const [bg, accent, highlight] = getPalette(title);
  const safeTitle = escapeSvgText(title);
  const safeGenre = escapeSvgText(genre.slice(0, 2).join(' / '));

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="55%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${highlight}" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#bg)" />
      <circle cx="320" cy="120" r="110" fill="rgba(255,255,255,0.12)" />
      <circle cx="90" cy="510" r="140" fill="rgba(255,255,255,0.08)" />
      <rect x="32" y="32" width="336" height="536" rx="28" fill="none" stroke="rgba(255,255,255,0.28)" />
      <text x="40" y="92" fill="white" font-family="Georgia, serif" font-size="28" opacity="0.78">${safeGenre}</text>
      <text x="40" y="410" fill="white" font-family="Georgia, serif" font-size="54" font-weight="700">
        <tspan x="40" dy="0">${safeTitle}</tspan>
      </text>
      <text x="40" y="520" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.85">${year}</text>
    </svg>
  `);
}

function createBackdrop(title: string, director: string) {
  const [bg, accent, highlight] = getPalette(`${title}-${director}`);
  const safeTitle = escapeSvgText(title);
  const safeDirector = escapeSvgText(director);

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="55%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${highlight}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#bg)" />
      <circle cx="980" cy="120" r="160" fill="rgba(255,255,255,0.14)" />
      <circle cx="220" cy="330" r="180" fill="rgba(255,255,255,0.08)" />
      <text x="72" y="210" fill="white" font-family="Georgia, serif" font-size="64" font-weight="700">${safeTitle}</text>
      <text x="72" y="258" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="28">Directed by ${safeDirector}</text>
    </svg>
  `);
}

// Mock movie database
const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Eternal Shadows',
    year: 2024,
    genre: ['Sci-Fi', 'Thriller'],
    director: 'Emma Torres',
    synopsis: 'In a world where memories can be extracted and sold, a detective must navigate through layers of stolen consciousness to solve a murder that never happened.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    rating: 8.7,
    duration: 142,
    popularity: 95,
    cast: ['Sarah Chen', 'Marcus Reid', 'David Park']
  },
  {
    id: '2',
    title: 'The Last Sunset',
    year: 2023,
    genre: ['Drama', 'Romance'],
    director: 'James Wilson',
    synopsis: 'Two strangers meet during the final sunset before eternal darkness falls on Earth, sharing their last hours together in unexpected companionship.',
    poster: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop',
    rating: 9.1,
    duration: 118,
    popularity: 88,
    cast: ['Lisa Morgan', 'Tom Anderson']
  },
  {
    id: '3',
    title: 'Neon Dreams',
    year: 2024,
    genre: ['Action', 'Cyberpunk'],
    director: 'Yuki Tanaka',
    synopsis: 'A hacker in Neo-Tokyo discovers a conspiracy that threatens to merge human consciousness with artificial intelligence.',
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=400&fit=crop',
    rating: 8.4,
    duration: 135,
    popularity: 92,
    cast: ['Kenji Yamamoto', 'Ai Sato', 'Ryan Lee']
  },
  {
    id: '4',
    title: 'Whispers in the Wind',
    year: 2023,
    genre: ['Fantasy', 'Adventure'],
    director: 'Sofia Martinez',
    synopsis: 'A young musician discovers she can hear the voices of the past through ancient melodies, leading her on a journey to prevent a forgotten catastrophe.',
    poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop',
    rating: 8.9,
    duration: 128,
    popularity: 85,
    cast: ['Elena Rodriguez', 'Michael Brown']
  },
  {
    id: '5',
    title: 'The Crimson Void',
    year: 2024,
    genre: ['Horror', 'Mystery'],
    director: 'Alex Chen',
    synopsis: 'An abandoned space station holds dark secrets as a rescue team discovers that isolation can manifest nightmares into reality.',
    poster: 'https://images.unsplash.com/photo-1574267432644-f2f4e4a19ae0?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=400&fit=crop',
    rating: 7.8,
    duration: 115,
    popularity: 78,
    cast: ['Jessica Kim', 'Robert Taylor', 'Nina Patel']
  },
  {
    id: '6',
    title: 'Atlas of Dreams',
    year: 2023,
    genre: ['Animation', 'Family'],
    director: 'Pierre Dubois',
    synopsis: 'A magical atlas transports a curious child to breathtaking worlds where imagination and reality blend seamlessly.',
    poster: 'https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    rating: 8.6,
    duration: 98,
    popularity: 90,
    cast: ['Voice: Emma Stone', 'Voice: Chris Pratt']
  },
  {
    id: '7',
    title: 'Silent Protocol',
    year: 2024,
    genre: ['Thriller', 'Action'],
    director: 'Marcus Stone',
    synopsis: 'A special forces operative goes rogue to expose a government conspiracy, racing against time before being silenced forever.',
    poster: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=400&fit=crop',
    rating: 8.2,
    duration: 125,
    popularity: 87,
    cast: ['Jake Morrison', 'Anna White', 'Carlos Mendez']
  },
  {
    id: '8',
    title: 'Echoes of Tomorrow',
    year: 2023,
    genre: ['Sci-Fi', 'Drama'],
    director: 'Lin Wei',
    synopsis: 'Scientists receive messages from the future, only to realize their attempts to change the timeline create the very catastrophe they sought to prevent.',
    poster: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=600&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=400&fit=crop',
    rating: 9.0,
    duration: 148,
    popularity: 93,
    cast: ['Wei Zhang', 'Sophie Laurent', 'Daniel Kim']
  }
].map((movie) => ({
  ...movie,
  poster: createPoster(movie.title, movie.year, movie.genre),
  backdrop: createBackdrop(movie.title, movie.director),
}));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapFilmDetail(item: FilmDetailDto): FilmDetail {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    releaseYear: item.releaseYear,
    producingCountry: item.producingCountry,
    rating: item.rating,
    poster: item.poster,
  };
}

export const filmService = {
  async searchMovies(filters: SearchFilters = {}): Promise<Movie[]> {
    await delay(400);
    
    let results = [...MOCK_MOVIES];
    
    // Apply search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.synopsis.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query)
      );
    }
    
    // Apply genre filter
    if (filters.genre) {
      results = results.filter(movie => movie.genre.includes(filters.genre!));
    }
    
    // Apply year filter
    if (filters.year) {
      results = results.filter(movie => movie.year === filters.year);
    }
    
    // Apply rating filter
    if (filters.minRating) {
      results = results.filter(movie => movie.rating >= filters.minRating!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'popularity':
            return b.popularity - a.popularity;
          case 'rating':
            return b.rating - a.rating;
          case 'year':
            return b.year - a.year;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    }
    
    return results;
  },

  async getMovieById(id: string): Promise<Movie | null> {
    await delay(300);
    return MOCK_MOVIES.find(movie => movie.id === id) || null;
  },

  async getFilmById(id: string): Promise<FilmDetail | null> {
    const normalizedId = id.trim();

    if (!normalizedId) {
      return null;
    }

    const response = await apiFetch(`/api/catalog/films/${normalizedId}`, {
      method: 'GET',
      auth: 'required',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseJsonSafely(response) as FilmDetailResponseDto | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        `Film detail failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!payload?.data?.id) {
      return null;
    }

    return mapFilmDetail(payload.data);
  },

  async getFeaturedMovies(): Promise<Movie[]> {
    await delay(400);
    return MOCK_MOVIES.slice(0, 4);
  },

  async getGenres(): Promise<string[]> {
    const genres = new Set<string>();
    MOCK_MOVIES.forEach(movie => {
      movie.genre.forEach(g => genres.add(g));
    });
    return Array.from(genres).sort();
  }
};
