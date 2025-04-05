import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ClipboardCheck, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/verify-email/:token');
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (match && params?.token) {
      verifyEmailWithToken(params.token);
    } else {
      // No token in URL, show manual verification form
      setStatus('verifying');
    }
  }, [match, params?.token]);

  const verifyEmailWithToken = async (token: string) => {
    setStatus('loading');
    try {
      const response = await fetch(`/api/verify-email/${token}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
        toast({
          title: 'Success',
          description: 'Your email has been verified successfully.',
          variant: 'default',
        });
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify email.');
        toast({
          title: 'Error',
          description: data.message || 'Failed to verify email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification.');
      toast({
        title: 'Error',
        description: 'An error occurred during verification.',
        variant: 'destructive',
      });
    }
  };

  const verifyWithCode = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    if (!verificationCode) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/verify-email/code', {
        email,
        code: verificationCode
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
        toast({
          title: 'Success',
          description: 'Your email has been verified successfully.',
        });
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify email.');
        toast({
          title: 'Error',
          description: data.message || 'Invalid verification code.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification.');
      toast({
        title: 'Error',
        description: 'An error occurred during verification.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/resend-verification', {
        email
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Set the verification code if returned in dev mode
        if (data.verificationCode) {
          setVerificationCode(data.verificationCode);
        }
        
        toast({
          title: 'Success',
          description: 'Verification email sent successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to resend verification email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while resending the verification email.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // For development only
  const bypassVerification = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/dev/verify-email', {
        email
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully via development shortcut.');
        toast({
          title: 'Success',
          description: 'Email verified successfully via development shortcut.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to verify email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during verification.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-600 to-blue-800 bg-no-repeat relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-[10%] w-40 h-40 rounded-lg border-4 border-white/20 rotate-12"></div>
        <div className="absolute bottom-10 right-[15%] w-60 h-60 rounded-lg border-4 border-white/20 -rotate-12"></div>
        <div className="absolute top-1/3 right-[25%] w-20 h-20 rounded-full border-4 border-white/20"></div>
        <div className="absolute bottom-1/4 left-[20%] w-80 h-16 rounded-lg border-4 border-white/20 rotate-45"></div>
        
        {/* Queue number display elements */}
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 bg-black/20 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
          <div className="text-9xl font-bold text-white/70 tracking-widest">42</div>
          <div className="text-center text-white/70">NEXT PATIENT</div>
        </div>
        
        <div className="absolute bottom-[15%] left-[70%] bg-green-500/20 p-3 rounded-lg border border-white/20 backdrop-blur-sm">
          <Clock className="h-8 w-8 text-white/70 mx-auto mb-1" />
          <div className="text-xl font-bold text-white/70">~5 min</div>
          <div className="text-xs text-white/70">WAIT TIME</div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-white dark:bg-slate-900 z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? 'Checking your verification status' : 'Verify your email to continue'}
          </CardDescription>
        </CardHeader>
        
        {status === 'loading' && (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-lg text-center">Verifying your email address...</p>
          </CardContent>
        )}
        
        {status === 'success' && (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg text-center">{message}</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              You can now log in with your account.
            </p>
          </CardContent>
        )}
        
        {status === 'error' && (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-lg text-center">{message}</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please try again or contact support.
            </p>
          </CardContent>
        )}
        
        {status === 'verifying' && (
          <CardContent>
            <Tabs defaultValue="code">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="code">Verification Code</TabsTrigger>
                <TabsTrigger value="resend">Resend Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    id="code"
                    placeholder="Enter the verification code from your email"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={verifyWithCode} 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Verify Code
                    </>
                  )}
                </Button>
                
                {/* Development shortcut button */}
                <Button 
                  onClick={bypassVerification} 
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full mt-2"
                >
                  <span className="text-xs">DEV: Bypass Verification</span>
                </Button>
              </TabsContent>
              
              <TabsContent value="resend" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resend-email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={resendVerificationEmail} 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => setLocation(`/auth?status=${status === 'success' ? 'verified' : 'error'}`)}
            variant={status === 'success' ? 'default' : 'outline'}
            className="w-full"
          >
            {status === 'success' ? 'Go to Login' : 'Return to Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}