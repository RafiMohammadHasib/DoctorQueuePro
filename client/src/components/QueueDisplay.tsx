import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QueueWithItems, QueueItemWithPatient } from '@shared/schema';
import { useSocket, getSocket } from '@/lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { queryClient } from '@/lib/queryClient';

interface QueueDisplayProps {
  queue?: QueueWithItems;
  isLoading: boolean;
  displayMode: 'monitor' | 'reception';
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ queue, isLoading, displayMode }) => {
  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!queue) return;

    const socket = getSocket();

    const handleQueueUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'queue_updated' && data.queueId === queue.id) {
          queryClient.invalidateQueries({ queryKey: ['/api/queues', queue.id] });
          queryClient.invalidateQueries({ queryKey: ['/api/doctors', queue.doctor.id, 'queue'] });
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
          queueId: queue.id
        }));
      } else {
        // If socket isn't open yet, wait for it
        socket.addEventListener('open', () => {
          socket.send(JSON.stringify({
            type: 'subscribe',
            queueId: queue.id
          }));
        }, { once: true });
      }
    };

    sendSubscription();

    return () => {
      socket.removeEventListener('message', handleQueueUpdate);
    };
  }, [queue]);

  if (isLoading || !queue) {
    return (
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
              <p className="text-lg text-gray-600">Loading queue...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter waiting items and sort by priority
  const waitingItems = queue.items 
    ? queue.items
        .filter(item => item.status === 'waiting')
        .sort((a, b) => {
          const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
          const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 2;
          const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 2;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          return new Date(a.timeAdded).getTime() - new Date(b.timeAdded).getTime();
        })
    : [];

  // Get the current patient in consultation
  const currentPatient = queue.items 
    ? queue.items.find(item => item.status === 'in-progress')
    : undefined;

  if (displayMode === 'monitor') {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="bg-gray-900 text-white p-6 rounded-t-lg">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">{queue.doctor?.name || 'Doctor'}</h2>
              <p className="text-gray-300">
                {queue.doctor?.specialization || 'Specialist'} • Room {queue.doctor?.roomNumber || 'TBD'}
              </p>
            </div>

            {/* Current patient section */}
            <div className="bg-primary-500 p-4 rounded-lg mb-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-primary-100">NOW SERVING</h3>
                  <div className="text-white text-xl font-bold mt-1">
                    {currentPatient 
                      ? currentPatient.patient.name 
                      : 'No patient currently being served'}
                  </div>
                  {currentPatient && (
                    <div className="mt-2">
                      <div className="flex items-center text-primary-100 text-sm">
                        <span className="font-medium mr-1">Case Type:</span> 
                        <span className="capitalize">{currentPatient.appointmentType}</span>
                        {currentPatient.priorityLevel !== 'normal' && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            currentPatient.priorityLevel === 'urgent'
                              ? 'bg-red-700 text-white'
                              : 'bg-amber-700 text-white'
                          }`}>
                            {currentPatient.priorityLevel.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-primary-100 text-sm mt-1">
                        <span className="font-medium">Started:</span> {
                          currentPatient.startTime 
                            ? new Date(currentPatient.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : 'Just now'
                        }
                      </div>
                      {currentPatient.startTime && (
                        <div className="text-primary-100 text-sm mt-1">
                          <span className="font-medium">Est. Completion:</span> {
                            (() => {
                              if (!currentPatient.startTime) return 'Unknown';
                              const startTime = new Date(currentPatient.startTime);
                              // Assume average consultation takes 15 minutes if no estimated time available
                              const duration = currentPatient.estimatedWaitTime || 15;
                              const estimatedEndTime = new Date(startTime.getTime() + duration * 60000);
                              return estimatedEndTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            })()
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-mono font-bold mb-2">
                    {currentPatient ? '01' : '--'}
                  </div>
                  {currentPatient && currentPatient.startTime && (
                    <div className="bg-primary-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next patients list */}
            <div className="space-y-3">
              {waitingItems.slice(0, 5).map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ backgroundColor: index === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                >
                  <div>
                    <div className="text-white font-medium">{item.patient.name}</div>
                    <div className="text-gray-300 text-sm">
                      Wait time: <span className={
                        item.estimatedWaitTime && item.estimatedWaitTime < 10 
                          ? 'text-amber-300' 
                          : 'text-green-300'
                      }>
                        {formatDistanceToNow(new Date(item.timeAdded), { addSuffix: false })}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {(index + 2).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}

              {waitingItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No patients in queue
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-white rounded-b-lg text-gray-500 text-sm text-center">
            <p>Queue updates in real-time</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reception mode (more detailed)
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{queue.doctor?.name || 'Doctor'}'s Queue</h2>
          <p className="text-sm text-gray-500">
            {queue.doctor?.isAvailable 
              ? 'Doctor is currently available' 
              : 'Doctor is currently busy'}
            • {waitingItems.length} patients waiting
          </p>
        </div>

        {currentPatient && (
          <div className="mb-4 p-4 bg-primary-50 border-l-4 border-primary-500 rounded-r-md">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Currently Consulting</h3>
                <p className="text-primary-700">{currentPatient.patient.name}</p>
                <p className="text-sm text-gray-500">
                  Consultation started {formatDistanceToNow(new Date(currentPatient.startTime!), { addSuffix: true })}
                </p>
              </div>
              <div className="text-primary-500 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
                01
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium mb-2">Waiting List</h3>
          {waitingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
              No patients in waiting queue
            </div>
          ) : (
            waitingItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-md border-l-4 ${
                  item.priorityLevel === 'urgent' 
                    ? 'bg-red-50 border-red-500' 
                    : item.priorityLevel === 'priority'
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{item.patient.name}</span>
                      {item.priorityLevel !== 'normal' && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          item.priorityLevel === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.priorityLevel.charAt(0).toUpperCase() + item.priorityLevel.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.patient.age && `${item.patient.age} yrs`}
                      {item.patient.gender && ` • ${item.patient.gender}`}
                      {` • ${item.appointmentType === 'new' ? 'First Visit' : 'Follow-up'}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Waiting since {formatDistanceToNow(new Date(item.timeAdded), { addSuffix: true })}
                    </div>
                  </div>
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white font-medium ${
                    item.priorityLevel === 'urgent'
                      ? 'bg-red-500'
                      : item.priorityLevel === 'priority'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  }`}>
                    {(index + 2).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueDisplay;
