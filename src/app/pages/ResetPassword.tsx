import { useState } from 'react';
import { Link } from 'react-router';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BrandLogo } from '../components/BrandLogo';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/20 via-background to-background dark:from-accent/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(191,163,122,0.24),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(138,129,120,0.1),transparent_20%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(191,163,122,0.14),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(138,129,120,0.1),transparent_18%)]" />

      <div className="w-full max-w-md space-y-8">
        <Link to="/" className="flex flex-col items-center gap-4 group transition-opacity hover:opacity-90">
          <BrandLogo
            className="h-[58px] w-auto object-contain transition-transform group-hover:scale-[1.02] sm:h-[64px]"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-2">
              {success 
                ? 'Check your email for reset instructions' 
                : 'Enter your email to receive reset instructions'}
            </p>
          </div>
        </Link>

        <div className="rounded-[1.7rem] border border-border/80 bg-card/94 p-8 shadow-[0_24px_70px_rgba(20,20,20,0.12)] backdrop-blur dark:shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Email Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent password reset instructions to <span className="text-foreground font-medium">{email}</span>. 
                  Please check your inbox and follow the link to reset your password.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/login">Back to Sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email address associated with your account
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        )}
          </div>
    </div>
  );
}

export default ResetPassword;
