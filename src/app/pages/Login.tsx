import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BrandLogo } from '../components/BrandLogo';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-background to-background dark:from-accent/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(200,181,154,0.28),transparent_40%),radial-gradient(circle_at_82%_16%,rgba(107,111,122,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(200,181,154,0.14),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(107,111,122,0.1),transparent_22%)]" />

        <div className="w-full max-w-md space-y-8">
          <Link to="/" className="flex flex-col items-center gap-4 group transition-opacity hover:opacity-90">
            <BrandLogo
              className="h-[58px] w-auto object-contain transition-transform group-hover:scale-[1.02] sm:h-[64px]"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold">Welcome to MovieVault</h1>
              <p className="text-muted-foreground mt-2">Sign in to manage your cinema collection</p>
            </div>
          </Link>

          <div className="rounded-[1.7rem] border border-border/80 bg-card/94 p-8 shadow-[0_24px_70px_rgba(44,47,58,0.12)] backdrop-blur dark:shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mv.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="rounded-lg border border-accent/40 bg-accent/14 px-4 py-3 text-sm">
                <p className="font-medium text-primary mb-1">Example Credentials:</p>
                <p className="text-muted-foreground">
                  Email: <span className="text-foreground">admin@mv.com</span><br />
                  Password: <span className="text-foreground">123Mv&apos;</span>
                </p>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create one now
            </Link>
          </p>
        </div>
    </div>
  );
}

export default Login;
