import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings as SettingsIcon, User, Mail, Shield, LogOut, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function Settings() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(user?.emailVerified || false);

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      await authService.verifyEmail();
      setVerified(true);
    } catch (error) {
      console.error('Failed to verify email:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <SettingsIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Profile Section */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-2">
                  {user.role}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input 
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                disabled
              />
            </div>
          </section>

          {/* Email Verification */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Email Verification</h2>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                {verified ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm text-muted-foreground">
                        Your email address has been verified
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                      <XCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Email Not Verified</p>
                      <p className="text-sm text-muted-foreground">
                        Verify your email to unlock all features
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!verified && (
                <Button onClick={handleVerifyEmail} disabled={verifying}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Now'
                  )}
                </Button>
              )}
            </div>
          </section>

          {/* Security & Access */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Security & Access</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Role</p>
                  <p className="text-sm text-muted-foreground">
                    Your current access level in the system
                  </p>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {user.role}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: Never
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Irreversible and destructive actions
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="outline" className="text-destructive border-destructive/30" disabled>
                  Delete Account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default Settings;
