import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DoctorWithQueue, QueueItemWithPatient, QueueStats as QueueStatsType } from '@shared/schema';
import { getSocket } from '@/lib/socket';
import { formatDistanceToNow, format, addDays, subDays } from 'date-fns';
import DoctorControls from '@/components/DoctorControls';
import QueueItem from '@/components/QueueItem';
import QueueStatsComponent from '@/components/QueueStats';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  List, 
  Grid, 
  Clock, 
  Users, 
  Activity, 
  CheckCircle, 
  Calendar, 
  Bell,
  FileText, 
  BarChart4, 
  TrendingUp 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import NotificationPanel from '@/components/NotificationPanel';

const DoctorDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  
  // For this demo version, we're setting a default doctor ID
  // In a real app, this would come from authentication
  const doctorId = 1;

  interface ExtendedDoctorWithQueue extends DoctorWithQueue {
    doctor: {
      id: number;
      name: string;
      specialization: string | null;
      isAvailable: boolean | null;
      roomNumber: string | null;
      userId: number | null;
    };
    queue: {
      id: number;
      name: string;
      doctorId: number;
      items: QueueItemWithPatient[];
    };
  }

  // Fetch doctor with queue information
  const { 
    data: doctorQueue, 
    isLoading: isLoadingQueue,
    refetch: refetchQueue
  } = useQuery<ExtendedDoctorWithQueue>({
    queryKey: ['/api/doctors', doctorId, 'queue'],
  });

  // Fetch doctor stats
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery<QueueStatsType>({
    queryKey: ['/api/doctors', doctorId, 'stats'],
  });

  // Call next patient mutation
  const callNextMutation = useMutation({
    mutationFn: async () => {
      if (!doctorQueue) return null;
      const response = await apiRequest('POST', `/api/queues/${doctorQueue.queue.id}/call-next`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'stats'] });
      toast({
        title: 'Next patient called',
        description: 'The next patient has been called to the consultation room.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error calling next patient',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Complete consultation mutation
  const completeConsultationMutation = useMutation({
    mutationFn: async (queueItemId: number) => {
      const response = await apiRequest('POST', `/api/queue-items/${queueItemId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'stats'] });
      toast({
        title: 'Consultation completed',
        description: 'The consultation has been marked as completed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error completing consultation',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Cancel consultation mutation
  const cancelConsultationMutation = useMutation({
    mutationFn: async (queueItemId: number) => {
      const response = await apiRequest('POST', `/api/queue-items/${queueItemId}/cancel`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'stats'] });
      toast({
        title: 'Consultation cancelled',
        description: 'The consultation has been cancelled.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error cancelling consultation',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle doctor availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/doctors/${doctorId}/toggle-availability`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'queue'] });
      toast({
        title: data.isAvailable ? 'Now Available' : 'Now Busy',
        description: data.isAvailable 
          ? 'You are now marked as available for consultations.' 
          : 'You are now marked as busy. No new patients will be called.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating availability',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!doctorQueue || !doctorQueue.queue) return;

    const socket = getSocket();

    const handleQueueUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'queue_updated' && data.queueId === doctorQueue.queue.id) {
          refetchQueue();
          refetchStats();
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
          queueId: doctorQueue.queue.id
        }));
      } else {
        // If socket isn't open yet, wait for it
        socket.addEventListener('open', () => {
          socket.send(JSON.stringify({
            type: 'subscribe',
            queueId: doctorQueue.queue.id
          }));
        }, { once: true });
      }
    };

    sendSubscription();

    return () => {
      socket.removeEventListener('message', handleQueueUpdate);
    };
  }, [doctorQueue, refetchQueue, refetchStats]);

  // Filter the queue items based on search term
  const filteredQueueItems = doctorQueue?.queue?.items?.filter((item: QueueItemWithPatient) => {
    if (!searchTerm) return item.status === 'waiting';
    
    const patient = item.patient;
    return (
      item.status === 'waiting' &&
      (
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
      )
    );
  }) || [];

  // Current patient in consultation
  const currentPatient = doctorQueue?.queue?.items?.find((item: QueueItemWithPatient) => item.status === 'in-progress');

  // Get waiting count by priority
  const waitingCounts = {
    total: filteredQueueItems.length,
    normal: filteredQueueItems.filter(item => item.priorityLevel === 'normal').length,
    priority: filteredQueueItems.filter(item => item.priorityLevel === 'priority').length,
    urgent: filteredQueueItems.filter(item => item.priorityLevel === 'urgent').length
  };

  // Handle calling the next patient
  const handleCallNext = () => {
    callNextMutation.mutate();
  };

  // Handle completing a consultation
  const handleCompleteConsultation = () => {
    if (currentPatient) {
      completeConsultationMutation.mutate(currentPatient.id);
    }
  };

  // Handle cancelling a consultation
  const handleCancelConsultation = () => {
    if (currentPatient) {
      cancelConsultationMutation.mutate(currentPatient.id);
    }
  };

  // Get estimated time for a patient
  const getEstimatedTime = (queueItem: QueueItemWithPatient) => {
    if (!stats || !stats.averageConsultTime) return 'N/A';
    
    const position = filteredQueueItems.findIndex((item: QueueItemWithPatient) => item.id === queueItem.id);
    const waitMinutes = (position + 1) * stats.averageConsultTime;
    
    const now = new Date();
    const estimatedTime = new Date(now.getTime() + waitMinutes * 60000);
    return format(estimatedTime, 'h:mm a');
  };

  // Calculate wait time display
  const getWaitTimeDisplay = (queueItem: QueueItemWithPatient) => {
    return formatDistanceToNow(new Date(queueItem.timeAdded), { addSuffix: false });
  };

  // Generate some mock upcoming appointments for the dashboard
  const getUpcomingAppointments = () => {
    const today = new Date();
    return [
      {
        id: 1,
        patientName: "John Smith",
        time: "10:30 AM",
        date: format(today, 'MMM d, yyyy'),
        type: "followup"
      },
      {
        id: 2,
        patientName: "Sarah Johnson",
        time: "1:15 PM",
        date: format(today, 'MMM d, yyyy'),
        type: "new"
      },
      {
        id: 3,
        patientName: "Emma Davis",
        time: "11:00 AM",
        date: format(addDays(today, 1), 'MMM d, yyyy'),
        type: "followup"
      }
    ];
  };

  if (isLoadingQueue || isLoadingStats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-primary-500">
            <svg className="animate-spin h-12 w-12 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Sidebar */}
      <DoctorSidebar waitingCount={waitingCounts.total} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Doctor Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, Dr. {doctorQueue?.doctor?.name?.split(" ")[1] || doctorQueue?.doctor?.name || ''}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </Button>
                {showNotifications && (
                  <NotificationPanel 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                  />
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patients Waiting</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold text-gray-900 mr-2">{waitingCounts.total}</h3>
                      {stats && <span className="text-xs text-gray-500">({stats.totalPatients} today)</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Consultations</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold text-gray-900 mr-2">{stats?.patientsSeen || 0}</h3>
                      <span className="text-xs text-gray-500">completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-amber-100 p-3 mr-4">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Wait Time</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold text-gray-900 mr-2">
                        {stats?.averageWaitTime ? `${Math.round(stats.averageWaitTime)}m` : 'N/A'}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-purple-100 p-3 mr-4">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Consult Time</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold text-gray-900 mr-2">
                        {stats?.averageConsultTime ? `${Math.round(stats.averageConsultTime)}m` : 'N/A'}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Doctor Controls & Current Patient Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {doctorQueue && (
                <DoctorControls
                  doctor={doctorQueue.doctor}
                  currentPatient={currentPatient}
                  stats={stats}
                  isAvailable={doctorQueue.doctor.isAvailable ?? false}
                  onCallNext={handleCallNext}
                  onCompleteConsultation={handleCompleteConsultation}
                  onCancelConsultation={handleCancelConsultation}
                  onToggleAvailability={() => toggleAvailabilityMutation.mutate()}
                  isPending={callNextMutation.isPending || completeConsultationMutation.isPending || cancelConsultationMutation.isPending}
                />
              )}
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Next 3 scheduled appointments
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div className="space-y-3">
                    {getUpcomingAppointments().map((appointment, index) => (
                      <div key={appointment.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {appointment.patientName.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {appointment.patientName}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {appointment.date} • {appointment.time}
                          </div>
                        </div>
                        <Badge variant={appointment.type === 'new' ? 'default' : 'secondary'}>
                          {appointment.type === 'new' ? 'New' : 'Follow-up'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 rounded-b-lg">
                  <Button variant="link" className="w-full text-sm">View All Appointments</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Queue Management Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Waiting Queue</CardTitle>
                  <CardDescription>
                    {filteredQueueItems.length} patients waiting
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-4 py-2"
                    />
                  </div>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3 py-1 h-9"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="px-3 py-1 h-9"
                    >
                      <Grid className="h-4 w-4 mr-1" />
                      Cards
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Queue Filter Tabs */}
              <Tabs defaultValue="all" className="mb-4">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center">
                    All Patients
                    <span className="ml-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {waitingCounts.total}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="regular" className="flex items-center">
                    Regular
                    <span className="ml-1 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {waitingCounts.normal}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="priority" className="flex items-center">
                    Priority
                    <span className="ml-1 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {waitingCounts.priority}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="urgent" className="flex items-center">
                    Urgent
                    <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {waitingCounts.urgent}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Queue Items List */}
              <div className="space-y-3">
                {filteredQueueItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No patients in queue</p>
                  </div>
                ) : (
                  filteredQueueItems.map((item, index) => (
                    <QueueItem
                      key={item.id}
                      queueItem={item}
                      position={index + 1}
                      waitTime={getWaitTimeDisplay(item)}
                      estimatedTime={getEstimatedTime(item)}
                      onCallNow={() => {
                        if (currentPatient) {
                          toast({
                            title: 'Cannot call patient',
                            description: 'There is already a patient in consultation.',
                            variant: 'destructive',
                          });
                        } else {
                          // In a real app, we would have an API to call a specific patient
                          // For now, we'll just use the call next feature
                          handleCallNext();
                        }
                      }}
                      viewMode={viewMode}
                    />
                  ))
                )}
              </div>

              {/* Pagination (simplified) */}
              {filteredQueueItems.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">1-{filteredQueueItems.length}</span> of{' '}
                    <span className="font-medium">{filteredQueueItems.length}</span> patients
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" disabled>
                      <span className="sr-only">Previous page</span>
                      ← Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <span className="sr-only">Next page</span>
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default DoctorDashboard;
