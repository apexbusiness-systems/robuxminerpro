import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, User } from '@supabase/supabase-js';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, Chrome } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(128);
const phoneSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, { message: "Invalid phone number format" });

interface AuthPageProps {
  mode?: 'signin' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'signin' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(mode);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  // Real-time validation
  const validateEmail = (value: string) => {
    try {
      emailSchema.parse(value);
      setEmailError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return false;
    }
  };

  const validatePassword = (value: string) => {
    try {
      passwordSchema.parse(value);
      setPasswordError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      }
      return false;
    }
  };

  const validatePhone = (value: string) => {
    if (!value) {
      setPhoneError('');
      return true;
    }
    try {
      phoneSchema.parse(value);
      setPhoneError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    setError('');
    setIsLoading(true);

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      setIsLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (isSignUp && phone && !validatePhone(phone)) {
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: displayName || email.split('@')[0],
              phone: phone || null,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      handleAuthError(error as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      handleAuthError(error as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: AuthError) => {
    let message = 'An unexpected error occurred';
    
    switch (error.message) {
      case 'Invalid login credentials':
        message = 'Invalid email or password';
        break;
      case 'User already registered':
        message = 'An account with this email already exists';
        break;
      case 'Email not confirmed':
        message = 'Please check your email and click the confirmation link';
        break;
      case 'Password should be at least 6 characters':
        message = 'Password must be at least 6 characters long';
        break;
      default:
        message = error.message;
    }
    
    setError(message);
    toast({
      title: "Authentication Error",
      description: message,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img 
            src="/official_logo.png" 
            alt="RobuxMinerPro" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            RobuxMinerPro
          </h1>
          <p className="text-muted-foreground mt-2">
            The ultimate Robux earning platform
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue earning Robux
                </CardDescription>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Join thousands of users earning Robux daily
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In */}
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>

                <Button
                  type="button"
                  onClick={() => handleEmailAuth(false)}
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        validatePhone(e.target.value);
                      }}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {password !== confirmPassword && confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => handleEmailAuth(true)}
                  disabled={isLoading || !email || !password || password !== confirmPassword}
                  className="w-full"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;