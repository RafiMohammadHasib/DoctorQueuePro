import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';
import NotFound from "@/pages/not-found";
import QueueMonitor from "@/pages/QueueMonitor";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorPatients from "@/pages/DoctorPatients";
import DoctorSettings from "@/pages/DoctorSettings";
import AdminDashboard from "@/pages/AdminDashboard";
import ReceptionKiosk from "@/pages/ReceptionKiosk";
import AuthPage from "@/pages/auth-page";
import VerifyEmailPage from "@/pages/verify-email";
import AppShell from "@/components/layout/AppShell";
import { SocketContext, getSocket } from "./lib/socket";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    try {
      const newSocket = getSocket();
      setSocket(newSocket);

      return () => {
        if ((window as any)._socketInstance === newSocket && newSocket.readyState === WebSocket.OPEN) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={QueueMonitor} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/verify-email/:token" component={VerifyEmailPage} />
        <ProtectedRoute path="/doctor" component={DoctorDashboard} requiredRole="doctor" />
        <ProtectedRoute path="/doctor/patients" component={DoctorPatients} requiredRole="doctor" />
        <ProtectedRoute path="/doctor/settings" component={DoctorSettings} requiredRole="doctor" />
        <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
        <ProtectedRoute path="/reception" component={ReceptionKiosk} requiredRole="receptionist" />
        <Route path="/monitor" component={QueueMonitor} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router />
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
