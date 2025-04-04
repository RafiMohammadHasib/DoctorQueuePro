import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QueueDisplay from '@/components/QueueDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSocket } from '@/lib/socket';
import { QueueWithItems, Queue } from '@shared/schema';
import { Separator } from '@/components/ui/separator';

const QueueMonitor: React.FC = () => {
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null);

  // Fetch all queues
  const { data: queues, isLoading: isLoadingQueues } = useQuery<Queue[]>({
    queryKey: ['/api/queues'],
  });

  // Fetch active queue details
  const { data: activeQueue, isLoading: isLoadingQueue, refetch: refetchQueue } = useQuery<QueueWithItems>({
    queryKey: ['/api/queues', activeQueueId],
    enabled: !!activeQueueId,
  });

  // Set the first queue as active if not already set
  useEffect(() => {
    if (queues && queues.length > 0 && !activeQueueId) {
      setActiveQueueId(queues[0].id);
    }
  }, [queues, activeQueueId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!activeQueueId) return;

    const socket = getSocket();

    const handleQueueUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'queue_updated' && data.queueId === activeQueueId) {
          refetchQueue();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleQueueUpdate);

    // Only send message when socket is open
    const sendSubscription = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'subscribe',
          queueId: activeQueueId
        }));
      } else {
        // If socket isn't open yet, wait for it
        socket.addEventListener('open', () => {
          socket.send(JSON.stringify({
            type: 'subscribe',
            queueId: activeQueueId
          }));
        }, { once: true });
      }
    };

    sendSubscription();

    return () => {
      socket.removeEventListener('message', handleQueueUpdate);
    };
  }, [activeQueueId, refetchQueue]);

  if (isLoadingQueues) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-4 text-primary-500">
                  <svg className="animate-spin h-12 w-12 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg text-gray-600">Loading queues...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Queue Monitor</h1>
        <p className="text-gray-600">View the current status of all queues</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Select Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {queues && queues.map((queue: Queue) => (
                <button
                  key={queue.id}
                  onClick={() => setActiveQueueId(queue.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium 
                    ${activeQueueId === queue.id 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {queue.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {activeQueueId && (
        <QueueDisplay
          queue={activeQueue}
          isLoading={isLoadingQueue}
          displayMode="monitor"
        />
      )}

      <Separator className="my-8" />

      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>This screen updates in real-time as the queue changes.</p>
        <p>For display in the waiting area, use fullscreen mode (F11).</p>
      </div>
    </div>
  );
};

export default QueueMonitor;
