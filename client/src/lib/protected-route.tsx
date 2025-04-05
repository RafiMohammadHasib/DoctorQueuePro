import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  requiredRole?: string;
};

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        // Redirect to auth page if email is not verified
        if (!user.isVerified) {
          return <Redirect to="/auth" />;
        }

        if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
          return <Redirect to="/" />;
        }

        return <Component />;
      }}
    </Route>
  );
}