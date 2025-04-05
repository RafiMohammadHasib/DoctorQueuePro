import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/verify-email/:token');
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!match || !params?.token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email/${params.token}`, {
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

    verifyEmail();
  }, [match, params?.token, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Checking your verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-lg text-center">Verifying your email address...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg text-center">{message}</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                You can now log in with your account.
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-lg text-center">{message}</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please try again or contact support.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => setLocation(`/auth?status=${status === 'success' ? 'success' : 'error'}`)}
            variant="default"
            className="w-full"
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}