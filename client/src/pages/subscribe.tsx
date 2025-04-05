import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, CreditCard, Loader2, Lock, ArrowLeft } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
}

// Define available plans
const plans: PlanDetails[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    price: 49,
    interval: 'month',
    description: 'Perfect for small clinics with 1-2 doctors',
    features: [
      'Up to 2 doctors',
      'Queue management',
      'Patient notifications',
      'Email support',
      'Basic analytics'
    ]
  },
  {
    id: 'professional-monthly',
    name: 'Professional',
    price: 99,
    interval: 'month',
    description: 'Ideal for growing practices with multiple doctors',
    features: [
      'Up to 10 doctors',
      'Advanced queue management',
      'SMS & Email notifications',
      'Priority support',
      'Advanced analytics',
      'Custom branding'
    ]
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    description: 'Comprehensive solution for multi-location practices',
    features: [
      'Unlimited doctors',
      'Premium queue management',
      'Full notification suite',
      '24/7 dedicated support',
      'Enterprise analytics',
      'Custom integrations',
      'Multi-location support'
    ]
  }
];

const CheckoutForm: React.FC<{ selectedPlan: PlanDetails }> = ({ selectedPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/subscription-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      } else {
        // Payment success will redirect via return_url
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Details</h3>
        <PaymentElement />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Plan</span>
          <span className="font-medium">{selectedPlan.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Billing Frequency</span>
          <span className="font-medium capitalize">{selectedPlan.interval}ly</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
          <span className="text-gray-700 font-medium">Total</span>
          <span className="font-bold">${selectedPlan.price.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button 
          type="button" 
          variant="ghost" 
          className="gap-1"
          onClick={() => setLocation('/pricing')}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {isLoading ? "Processing..." : `Pay $${selectedPlan.price.toFixed(2)}`}
        </Button>
      </div>
      
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-6">
        <Lock className="h-3 w-3" /> Secured by Stripe. We don't store your payment details.
      </div>
    </form>
  );
};

const SubscriptionPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [selectedPlanId, setSelectedPlanId] = useState('professional-monthly');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId) || plans[1]; // Default to Professional

  useEffect(() => {
    if (!user) {
      setLocation('/auth?redirect=/subscribe');
      return;
    }

    // Create PaymentIntent when the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: selectedPlan.price,
          planId: selectedPlan.id
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createPaymentIntent();
  }, [user, selectedPlan, setLocation, toast]);

  // Prepare options for the Stripe Elements
  const appearance: any = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0366d6',
    },
  };
  
  const options: any = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
          
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Secure Checkout</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Subscribe to QueueMaster</h1>
            <p className="text-gray-600 mt-2">Select your plan and complete your subscription</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>Select the plan that's right for your practice</CardDescription>
                
                <div className="mt-4">
                  <Tabs 
                    defaultValue="month" 
                    onValueChange={(value) => setBillingInterval(value as 'month' | 'year')}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="month">Monthly</TabsTrigger>
                      <TabsTrigger value="year">Yearly (Save 10%)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlanId === plan.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-sm text-gray-500">per {plan.interval}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      
                      {plan.features.length > 3 && (
                        <div className="text-sm text-primary">
                          +{plan.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your subscription securely</CardDescription>
              </CardHeader>
              
              <CardContent>
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm selectedPlan={selectedPlan} />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-gray-500">Preparing payment form...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Information */}
          <div className="bg-white border rounded-lg p-6 text-center">
            <h3 className="font-medium mb-2">Money-Back Guarantee</h3>
            <p className="text-gray-600 text-sm">
              Not satisfied with QueueMaster? Get a full refund within the first 30 days.
              No questions asked.
            </p>
            
            <div className="flex justify-center items-center gap-8 mt-6">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Secure Payment</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;