import { Link, useLocation } from 'react-router';
import { Film } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Button } from './ui/button';

export function LandingNavbar() {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isResetPage = location.pathname === '/reset-password';

  return (
    <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
          <Film className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">MovieVault</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">Showcase Edition</p>
        </div>
      </Link>
      
      <div className="flex items-center gap-3">
        <Link 
          to="/ai-content" 
          className="mr-2 hidden text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
        >
          Reviews
        </Link>
        {/* If authenticated, show a direct link to the app */}
        {isAuthenticated ? (
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link to="/home">Open Dashboard</Link>
          </Button>
        ) : (
          <>
            {/* Show Sign In if not on login/reset pages */}
            {!isLoginPage && !isResetPage && (
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
            )}

            {/* Show Home button if on auth pages so users can go back */}
            {(isLoginPage || isRegisterPage || isResetPage) && (
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/">Home</Link>
              </Button>
            )}

            {/* Show Create Account if not on register page */}
            {!isRegisterPage ? (
              <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link to="/register">Create account</Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
