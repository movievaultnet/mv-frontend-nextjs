import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Star, Clock, Calendar, User, Loader2, Sparkles } from 'lucide-react';
import { filmService, type Movie } from '../services/film.service';
import { iaService, type AIArticle } from '../services/ia.service';
import { Navbar } from '../components/Navbar';
import { AIArticleBlock } from '../components/AIArticleBlock';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [articles, setArticles] = useState<AIArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      void loadMovieData(id);
    }
  }, [id]);

  const loadMovieData = async (movieId: string) => {
    setLoading(true);

    try {
      const [movieData, articleData] = await Promise.all([
        filmService.getMovieById(movieId),
        iaService.getArticlesByMovieId(movieId),
      ]);
      setMovie(movieData);
      setArticles(articleData);
    } catch (error) {
      console.error('Failed to load movie:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-2xl font-bold">Movie not found</h2>
          <p className="mb-4 text-muted-foreground">The movie you're looking for doesn't exist</p>
          <Button asChild>
            <Link to="/catalog">Browse Catalog</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="relative h-[400px] overflow-hidden">
          <ImageWithFallback
            src={movie.backdrop}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-64 pb-12">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex-shrink-0">
                <ImageWithFallback
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full rounded-2xl border-4 border-border shadow-2xl lg:w-80"
                />
              </div>

              <div className="flex-1 space-y-6 pt-8 lg:pt-16">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold sm:text-5xl">{movie.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{movie.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{movie.rating.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {movie.genre.map((genre) => (
                    <Badge key={genre} variant="secondary" className="px-3 py-1 text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <span>Directed by <span className="font-medium text-foreground">{movie.director}</span></span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Synopsis</h3>
                  <p className="leading-relaxed text-muted-foreground">{movie.synopsis}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor) => (
                      <Badge key={actor} variant="outline">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/catalog">Find an edition</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/collection">View Collection</Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Collection items are now owned as backend edition records, so collection actions happen from release pages instead of abstract movie records.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-12" />

          {articles.length > 0 && (
            <div className="pb-12">
              <div className="mb-8 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
              </div>
              <div className="space-y-8">
                {articles.map((article) => (
                  <AIArticleBlock key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MovieDetail;
