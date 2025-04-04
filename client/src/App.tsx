import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';
import NotFound from "@/pages/not-found";
import QueueMonitor from "@/pages/QueueMonitor";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ReceptionKiosk from "@/pages/ReceptionKiosk";
import AppShell from "@/components/layout/AppShell";
import { SocketContext, getSocket } from "./lib/socket";

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
        <Route path="/doctor" component={DoctorDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/reception" component={ReceptionKiosk} />
        <Route path="/monitor" component={QueueMonitor} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router />
        <Toaster />
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
