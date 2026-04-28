import { Clock, Sparkles, Tag } from 'lucide-react';
import { Link } from 'react-router';
import type { AIArticle } from '../services/ia.service';
import { Badge } from './ui/badge';

interface AIArticleBlockProps {
  article: AIArticle;
  compact?: boolean;
  href?: string;
}

export function AIArticleBlock({ article, compact = false, href }: AIArticleBlockProps) {
  const getModelColor = () => {
    switch (article.model) {
      case 'Gemini 2.5 Flash':
        return 'border-accent/40 bg-accent/16 text-primary dark:text-accent';
      case 'Gemini Pro':
        return 'border-accent/40 bg-accent/16 text-primary dark:text-accent';
      case 'GPT-4':
        return 'border-primary/30 bg-primary/10 text-primary dark:text-primary-foreground';
      case 'Claude 3':
        return 'border-border bg-secondary/60 text-foreground';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (compact) {
    return (
      <Link
        to={href ?? `/ai-content/${article.slug}`}
        className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                {article.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className={getModelColor()}>
                  {article.model}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min read
                </span>
              </div>
            </div>
          </div>

          <p className="line-clamp-3 text-sm text-muted-foreground">
            {article.excerpt}
          </p>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-secondary/30 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{article.title}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="outline" className={getModelColor()}>
                  {article.model}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime} min read
                </span>
                <span>{new Date(article.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none px-6 py-6 prose-sm">
        <div
          className="leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {article.tags.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
