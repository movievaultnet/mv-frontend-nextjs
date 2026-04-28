import { Link, useLocation } from 'react-router';
import { authService } from '../services/auth.service';
import { Button } from './ui/button';
import { BrandLogo } from './BrandLogo';

export function LandingNavbar() {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isResetPage = location.pathname === '/reset-password';

  return (
    <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/" className="group flex items-center transition-opacity hover:opacity-90">
        <BrandLogo
          className="h-[43px] w-auto object-contain sm:h-[50px]"
        />
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
