import { useEffect, useState } from 'react';
import { Brain, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { iaService, type AIArticle } from '../services/ia.service';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { LandingNavbar } from '../components/LandingNavbar';
import { authService } from '../services/auth.service';

export function AIContent() {
  const [articles, setArticles] = useState<AIArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      const articleData = await iaService.getAllArticles();
      setArticles(articleData);
    } catch (loadError) {
      console.error('Failed to load articles:', loadError);
      setError('Unable to load AI articles right now.');
    } finally {
      setLoading(false);
    }
  };

  const getModelColor = (model: string) => {
    switch (model) {
      case 'Gemini 2.5 Flash':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const isAuthenticated = authService.isAuthenticated();

  return (
    <>
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_42%,rgba(9,9,10,1))]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cinema Reviews</h1>
                <p className="mt-1 text-muted-foreground">
                  Expert editorials and movie reviews powered by MovieVault
                </p>
              </div>
            </div>

            <div className="max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div className="text-sm text-foreground">
                  New edition creation events trigger article generation in the IA service. This page lists the real posts stored by that backend.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <h3 className="text-xl font-semibold">Could not load AI content</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => void loadArticles()}>
                Retry
              </Button>
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex flex-col gap-6 p-6 sm:flex-row">
                    {article.imageUrl ? (
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-auto w-full rounded-lg object-cover sm:w-40"
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={getModelColor(article.model)}>
                            {article.model}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.generatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{article.readTime} min read</span>
                        </div>
                        <Link to={`/ai-content/${article.slug}`} className="block">
                          <h2 className="text-2xl font-bold transition-colors hover:text-primary">
                            {article.title}
                          </h2>
                        </Link>
                      </div>

                      <p className="line-clamp-3 leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link to={`/ai-content/${article.slug}`}>Read article</Link>
                        </Button>
                        {article.productUrl ? (
                          <Button asChild variant="outline">
                            <a href={article.productUrl} target="_blank" rel="noreferrer">
                              Open shop
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Brain className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No articles available</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AIContent;
