import { Link } from 'react-router';
import { authService } from '../services/auth.service';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  const user = authService.getCurrentUser();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_0.8fr_0.8fr]">
          <div className="space-y-4">
            <Link to={user ? '/home' : '/'} className="inline-flex items-center transition-opacity hover:opacity-90">
              <BrandLogo
                className="h-[40px] w-auto object-contain sm:h-[44px]"
              />
            </Link>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Physical movie collecting, release discovery, and collection tracking in one place.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">Explore</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to={user ? '/catalog' : '/'} className="transition-colors hover:text-foreground">
                Catalog
              </Link>
              <Link to="/ai-content" className="transition-colors hover:text-foreground">
                Reviews
              </Link>
              <Link to={user ? '/ranking' : '/'} className="transition-colors hover:text-foreground">
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">Account</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {user ? (
                <>
                  <Link to="/home" className="transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link to="/collection" className="transition-colors hover:text-foreground">
                    My Collection
                  </Link>
                  <Link to="/settings" className="transition-colors hover:text-foreground">
                    Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="transition-colors hover:text-foreground">
                    Sign in
                  </Link>
                  <Link to="/register" className="transition-colors hover:text-foreground">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/80 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{`(c) ${year} MovieVault. All rights reserved.`}</p>
          <p>TMDB discovery and metadata power parts of the catalog experience.</p>
        </div>
      </div>
    </footer>
  );
}
