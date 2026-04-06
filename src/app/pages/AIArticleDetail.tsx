import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { LandingNavbar } from '../components/LandingNavbar';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AIArticleBlock } from '../components/AIArticleBlock';
import { iaService, type AIArticle } from '../services/ia.service';

export function AIArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<AIArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('Article not found.');
      return;
    }

    void loadArticle(slug);
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    setLoading(true);
    setError(null);

    try {
      const articleData = await iaService.getArticleBySlug(articleSlug);
      if (!articleData) {
        setError('Article not found.');
      } else {
        setArticle(articleData);
      }
    } catch (loadError) {
      console.error('Failed to load article:', loadError);
      setError('Unable to load this AI article right now.');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = authService.isAuthenticated();

  return (
    <>
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_42%,rgba(9,9,10,1))]">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" className="mb-4 -ml-4">
              <Link to="/ai-content">
                <ArrowLeft className="h-4 w-4" />
                Back to AI content
              </Link>
            </Button>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error || !article ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <h2 className="text-2xl font-bold">Article unavailable</h2>
                <p className="mt-2 text-muted-foreground">{error ?? 'This article could not be found.'}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {article.model}
                  </Badge>
                  <Badge variant="secondary">{article.readTime} min read</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(article.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-bold font-serif leading-tight">{article.title}</h1>
                  <p className="max-w-3xl text-sm uppercase tracking-widest text-primary font-medium">
                    MovieVault Editorial Review
                  </p>
                </div>

                {article.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <ImageWithFallback
                      src={article.imageUrl}
                      alt={article.title}
                      className="h-[320px] w-full object-cover"
                    />
                  </div>
                ) : null}

                <AIArticleBlock article={article} />

                <div className="flex flex-wrap gap-3">
                  {article.productUrl ? (
                    <Button asChild>
                      <a href={article.productUrl} target="_blank" rel="noreferrer">
                        Open edition in shop
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline">
                    <Link to="/ai-content">
                      <Sparkles className="h-4 w-4" />
                      More AI articles
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AIArticleDetail;
