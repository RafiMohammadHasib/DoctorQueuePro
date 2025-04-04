// Re-export from App.tsx for compatibility
import { useSocket } from '../App';

// Get the WebSocket instance from the window object
export const getSocket = (): WebSocket => {
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

  // Create a new socket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const socket = new WebSocket(wsUrl);
  
  // Set up event handlers
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

  // Save the instance
  windowWithSocket._socketInstance = socket;
  
  return socket;
};
