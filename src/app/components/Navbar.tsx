import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut, Settings, Search, Library, Brain, Clapperboard } from 'lucide-react';
import { authService } from '../services/auth.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { BrandLogo } from './BrandLogo';
import { ThemeModeToggle } from './ThemeModeToggle';

interface NavbarProps {
  variant?: 'app' | 'hero';
}

export function Navbar({ variant = 'app' }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [catalogQuery, setCatalogQuery] = useState('');
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isResetPage = location.pathname === '/reset-password';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCatalogSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedQuery = catalogQuery.trim();

    if (!normalizedQuery) {
      navigate('/catalog');
      return;
    }

    navigate(`/catalog?query=${encodeURIComponent(normalizedQuery)}`);
  };

  return (
    <nav
      className={cn(
        variant === 'app'
          ? 'sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80'
          : 'relative z-50',
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8',
          variant === 'app' ? '' : '',
        )}
      >
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2 shrink-0">
            <BrandLogo
              className="h-[38px] w-auto object-contain sm:h-[42px]"
            />
          </Link>

          {user && (
            <div className="hidden min-w-0 flex-1 md:flex md:justify-center">
            <form onSubmit={handleCatalogSearchSubmit} className="w-full max-w-2xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={catalogQuery}
                  onChange={(event) => setCatalogQuery(event.target.value)}
                  placeholder="Search releases, films, barcodes..."
                  className="h-11 rounded-full border-border bg-background/70 pl-11 pr-28 shadow-sm transition-colors focus-visible:ring-primary/20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Search
                </button>
              </div>
            </form>
            </div>
          )}

          {user ? (
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <ThemeModeToggle compact />

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-3 rounded-full border border-border bg-secondary/50 py-1.5 pl-1.5 pr-4 transition-colors hover:bg-secondary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/catalog')}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Catalog</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/collection')}>
                    <Library className="mr-2 h-4 w-4" />
                    <span>My Collection</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ai-content')}>
                    <Brain className="mr-2 h-4 w-4" />
                    <span>Reviews</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ranking')}>
                    <Clapperboard className="mr-2 h-4 w-4" />
                    <span>Leaderboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <ThemeModeToggle compact />

              <Link
                to="/ai-content"
                className="mr-2 hidden text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
              >
                Reviews
              </Link>

              {!isLoginPage && !isResetPage && variant !== 'hero' && (
                <Link
                  to="/login"
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign in
                </Link>
              )}

              {(isLoginPage || isRegisterPage || isResetPage) && (
                <Link
                  to="/"
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Home
                </Link>
              )}

              {variant === 'hero' ? (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  Sign in
                </Link>
              ) : !isRegisterPage ? (
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  Create account
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  Sign in
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
