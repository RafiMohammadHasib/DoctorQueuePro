import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { createContext, useContext, useEffect, useState } from 'react';
import NotFound from "@/pages/not-found";
import QueueMonitor from "@/pages/QueueMonitor";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ReceptionKiosk from "@/pages/ReceptionKiosk";
import AppShell from "@/components/layout/AppShell";

// Create a socket context
const SocketContext = createContext<WebSocket | null>(null);

// Hook to access the socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// Initialize WebSocket with singleton pattern
function getSocket(): WebSocket {
  if (typeof window === 'undefined') {
    throw new Error('WebSocket can only be initialized in browser environment');
  }

  const windowWithSocket = window as Window & {
    _socketInstance?: WebSocket;
  };

  if (windowWithSocket._socketInstance && 
    (windowWithSocket._socketInstance.readyState === WebSocket.OPEN || 
     windowWithSocket._socketInstance.readyState === WebSocket.CONNECTING)) {
    return windowWithSocket._socketInstance;
  }

  // If there was a previous socket with a closed state, clean it up first
  if (windowWithSocket._socketInstance) {
    delete windowWithSocket._socketInstance;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
    // In case of error, we'll clean up the instance to allow for reconnection
    if (windowWithSocket._socketInstance) {
      delete windowWithSocket._socketInstance;
    }
  });

  socket.addEventListener('close', (event) => {
    console.log(`WebSocket connection closed with code ${event.code}`);
    // Remove the instance when closed so we can create a new one later
    if (windowWithSocket._socketInstance) {
      delete windowWithSocket._socketInstance;
    }
  });

  windowWithSocket._socketInstance = socket;
  return socket;
}

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
