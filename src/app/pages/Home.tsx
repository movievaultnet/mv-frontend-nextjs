import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Film as FilmIcon, TrendingUp, Brain, ArrowRight, Loader2, Star } from 'lucide-react';
import { authService } from '../services/auth.service';
import { rankingService, type UserScore } from '../services/ranking.service';
import { iaService, type AIArticle } from '../services/ia.service';
import { landingService, type LandingMovie } from '../services/landing.service';
import { Navbar } from '../components/Navbar';
import { AIArticleBlock } from '../components/AIArticleBlock';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

function DiscoverShowcaseCard({ movie }: { movie: LandingMovie }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary lg:aspect-auto">
          <ImageWithFallback
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs text-white backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {movie.rating.toFixed(1)}
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Public discover</Badge>
            <Badge variant="outline">Release {movie.releaseYear}</Badge>
          </div>

          <div>
            <h3 className="text-3xl font-bold">{movie.title}</h3>
            <p className="mt-3 line-clamp-5 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {movie.synopsis}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Release date: {movie.releaseDate || 'TBA'}</span>
            <span>TMDB score: {movie.rating.toFixed(1)}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/catalog">
                Open catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const user = authService.getCurrentUser();
  const userId = user?.id || '1';
  const [discoverMovies, setDiscoverMovies] = useState<LandingMovie[]>([]);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [aiArticles, setAiArticles] = useState<AIArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movies, score, articles] = await Promise.all([
          landingService.getDiscoverMovies({ page: 1, sortBy: 'popularity.desc' }),
          rankingService.getUserScore(userId),
          iaService.getAllArticles(),
        ]);
        setDiscoverMovies(movies.slice(0, 6));
        setUserScore(score);
        setAiArticles(articles.slice(0, 3));
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const levelProgress = userScore ? rankingService.getNextLevelProgress(userScore.totalScore) : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_45%,rgba(9,9,10,1))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(140,106,67,0.18),transparent_42%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Welcome back, {user?.name}
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                  Your Cinema Universe
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Explore, collect, and discover movies enriched with AI-generated insights. 
                  Track your journey and compete with fellow cinephiles.
                </p>
              </div>

              {/* Quick Stats */}
              {userScore && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl pt-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Level</span>
                    </div>
                    <p className="text-2xl font-bold">{userScore.level}</p>
                    {levelProgress && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {levelProgress.percentage.toFixed(0)}% to next
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FilmIcon className="h-4 w-4" />
                      <span className="text-sm">Movies</span>
                    </div>
                    <p className="text-2xl font-bold">{userScore.moviesWatched}</p>
                    <p className="text-xs text-muted-foreground mt-1">watched</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Brain className="h-4 w-4" />
                      <span className="text-sm">Reviews</span>
                    </div>
                    <p className="text-2xl font-bold">{userScore.reviewsWritten}</p>
                    <p className="text-xs text-muted-foreground mt-1">written</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Rank</span>
                    </div>
                    <p className="text-2xl font-bold">#{userScore.rank}</p>
                    <p className="text-xs text-muted-foreground mt-1">global</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Discover Showcase */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Discover Showcase</h2>
                <p className="text-muted-foreground mt-1">Live titles coming from the public discover endpoint</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/catalog">
                  Open Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {discoverMovies.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {discoverMovies.map((movie) => (
                    <CarouselItem key={movie.id}>
                      <DiscoverShowcaseCard movie={movie} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 top-4 translate-y-0" />
                <CarouselNext className="right-4 top-4 translate-y-0" />
              </Carousel>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                The discover feed is empty right now.
              </div>
            )}
          </section>

          {/* AI Insights */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
                <p className="text-muted-foreground mt-1">Deep dives powered by artificial intelligence</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/ai-content">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {aiArticles.map((article) => (
                <AIArticleBlock key={article.id} article={article} compact href={`/ai-content/${article.slug}`} />
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/catalog" 
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative z-10">
                <FilmIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Explore Catalog</h3>
                <p className="text-muted-foreground">
                  Browse our extensive collection of movies from all genres and eras
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary font-medium">
                  Start exploring
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link 
              to="/ranking" 
              className="group relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(140,106,67,0.22),rgba(111,29,27,0.08))] p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative z-10">
                <TrendingUp className="mb-4 h-12 w-12 text-[#8c6a43]" />
                <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
                <p className="text-muted-foreground">
                  See how you rank against other movie enthusiasts worldwide
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-500 font-medium">
                  View rankings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}

export default Home;
