import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleToggleForm = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFullName("");
    setSignUpSuccess(false);
    setAgreedToTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Sign Up
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Success!", {
          description: "Please check your email to verify your account.",
        });
        setSignUpSuccess(true);
      }
    } else {
      // Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create an account' : 'Welcome back'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Enter your details to create your account' : 'Enter your email and password to sign in'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {signUpSuccess ? (
              <div className="text-center py-4">
                <h3 className="text-xl font-semibold mb-2">Check your email</h3>
                <p className="text-muted-foreground">
                  We've sent a confirmation link to <span className="font-semibold text-primary">{email}</span>.
                </p>
                <p className="text-muted-foreground mt-2">
                  Please click the link to complete your registration.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={handleToggleForm}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                  </div>
                  {!isSignUp && (
                    <div className="flex justify-end -mt-2">
                       <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}
                  {isSignUp && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                      <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        I agree to the{' '}
                        <Link to="/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                          Terms of Service
                        </Link>
                      </Label>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading || (isSignUp && !agreedToTerms)}>
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button 
                    onClick={handleToggleForm} 
                    className="font-semibold text-primary hover:underline ml-1"
                    disabled={loading}
                  >
                    {isSignUp ? 'Sign In' : 'Sign up'}
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
