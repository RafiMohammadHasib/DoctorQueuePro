import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Clock, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Shield,
  ArrowLeft,
  Loader2 
} from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FormError from '@/components/ui/FormError';

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.string().default('user'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { user, loginMutation, registerMutation } = useAuth();

  // Get tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onError: (error) => {
        setServerError('Invalid username or password. Please try again.');
      }
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onError: (error) => {
        setServerError(error.message || 'Registration failed. Please try again.');
      }
    });
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setServerError(null);
    // Update URL without navigating
    const url = new URL(window.location.href);
    if (value === 'register') {
      url.searchParams.set('tab', 'register');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col">
      {/* Top Navigation */}
      <header className="container mx-auto px-4 py-5">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">QueueMaster</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-10 py-10">
        {/* Left column - Auth Card */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg py-3">Log In</TabsTrigger>
              <TabsTrigger value="register" className="text-lg py-3">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-md text-white">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                  <CardDescription className="text-white/70">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {serverError && <FormError message={serverError} />}
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  placeholder="Enter your username" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="Enter your password" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-white/70 hover:text-white"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="w-full bg-white text-blue-700 hover:bg-white/90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            <>
                              Log In
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-white/10 pt-5">
                  <div className="text-sm text-white/70 text-center">
                    Don't have an account?{" "}
                    <button
                      className="text-white font-medium hover:underline"
                      onClick={() => handleTabChange("register")}
                    >
                      Sign up
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-md text-white">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                  <CardDescription className="text-white/70">
                    Enter your information to register
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {serverError && <FormError message={serverError} />}
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  placeholder="Enter your full name" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  placeholder="Choose a username" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  placeholder="Enter your email" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="Create a password" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-white/70 hover:text-white"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                                <Input 
                                  {...field} 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm your password" 
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 text-white/70 hover:text-white"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  <span className="sr-only">
                                    {showConfirmPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="w-full bg-white text-blue-700 hover:bg-white/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Sign Up
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-white/10 pt-5">
                  <div className="text-sm text-white/70 text-center">
                    Already have an account?{" "}
                    <button
                      className="text-white font-medium hover:underline"
                      onClick={() => handleTabChange("login")}
                    >
                      Log in
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right column - Hero Content */}
        <motion.div 
          className="hidden lg:block w-full max-w-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-white">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-full mr-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Trusted by 1,200+ Medical Clinics</h2>
            </div>
            
            <h3 className="text-4xl font-bold mb-6">
              Streamline Your <br />
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Patient Queue Management
              </span>
            </h3>
            
            <p className="text-white/80 text-xl mb-8">
              QueueMaster helps you manage patient flow efficiently, 
              reduce wait times, and improve patient satisfaction.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "40%", text: "Reduction in patient wait times" },
                { number: "30%", text: "Increase in daily patient capacity" },
                { number: "85%", text: "Improvement in patient satisfaction" },
                { number: "24/7", text: "Access to queue analytics" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                >
                  <p className="text-3xl font-bold text-white">{stat.number}</p>
                  <p className="text-white/70">{stat.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;