import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "doctor", "receptionist"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [_, navigate] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const { user, loginMutation, registerMutation } = useAuth();
  const search = useSearch();
  
  // Check for verification status in query params
  useEffect(() => {
    const params = new URLSearchParams(search);
    const status = params.get("status");
    if (status === "success") {
      setVerificationStatus("success");
    } else if (status === "pending") {
      setVerificationStatus("pending");
    } else if (status === "error") {
      setVerificationStatus("error");
    }
  }, [search]);

  // Handle login errors specifically for verification issues
  useEffect(() => {
    if (loginMutation.error) {
      if (loginMutation.error.message.includes("verify your email")) {
        setVerificationStatus("pending");
      }
    }
  }, [loginMutation.error]);
  
  // Effect to handle registration success to show verification needed alert
  useEffect(() => {
    if (registerMutation.isSuccess) {
      setVerificationStatus("pending");
    }
  }, [registerMutation.isSuccess]);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "receptionist",
    },
  });

  const onLogin = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegister = async (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Queue Management System
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
            
            {verificationStatus === "success" && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Email Verified</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your email has been successfully verified. You can now log in to your account.
                </AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === "pending" && (
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Verification Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Please check your email for a verification link. You need to verify your email before logging in.
                </AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === "error" && (
              <Alert className="mt-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  We couldn't verify your email. The link may have expired or is invalid. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit(onLogin)}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      {...registerLogin("username")}
                      placeholder="Enter your username"
                    />
                    {loginErrors.username && (
                      <p className="text-sm text-red-500">
                        {loginErrors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...registerLogin("password")}
                      placeholder="Enter your password"
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit(onRegister)}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      {...registerSignup("name")}
                      placeholder="Enter your full name"
                    />
                    {registerErrors.name && (
                      <p className="text-sm text-red-500">
                        {registerErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerSignup("username")}
                      placeholder="Choose a username"
                    />
                    {registerErrors.username && (
                      <p className="text-sm text-red-500">
                        {registerErrors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      {...registerSignup("email")}
                      placeholder="Enter your email address"
                    />
                    {registerErrors.email && (
                      <p className="text-sm text-red-500">
                        {registerErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerSignup("password")}
                      placeholder="Choose a password"
                    />
                    {registerErrors.password && (
                      <p className="text-sm text-red-500">
                        {registerErrors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <select
                      id="register-role"
                      {...registerSignup("role")}
                      className="flex w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="receptionist">Receptionist</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {registerErrors.role && (
                      <p className="text-sm text-red-500">
                        {registerErrors.role.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <div className="flex-1 bg-primary/10 p-6 flex flex-col justify-center hidden md:flex">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Medical Queue Management System
          </h1>
          <p className="text-lg mb-6">
            A comprehensive solution for managing patient queues in medical
            facilities. Improve efficiency and enhance patient experience with
            our real-time queue management system.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Real-time queue updates
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Patient notification system
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Simplified patient registration
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Doctor availability management
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}