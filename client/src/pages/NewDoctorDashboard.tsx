import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  MoreVertical,
  RefreshCw,
  Plus,
  FileText,
  Map,
  ExternalLink,
  Clipboard,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Mock stats for the design - these would be fetched from the API in a real app
const MOCK_STATS = {
  totalPatients: 32,
  totalConsultations: 14,
  waitingPatients: 3,
  consultationProgress: 65,
};

// Task status types
type TaskStatus = 'todo' | 'in-progress' | 'completed';

// Task interface
interface Task {
  id: number;
  title: string;
  type: string;
  dueIn: string;
  status: TaskStatus;
  assignedTo: {
    name: string;
    image?: string;
  };
}

// Location interface
interface Location {
  id: number;
  name: string;
  address: string;
  estimatedDate?: string;
}

const NewDoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Dummy tasks for the UI design
  const tasks: Task[] = [
    {
      id: 1,
      title: 'Examine patient John Doe',
      type: 'Examination',
      dueIn: 'Within 1 hour',
      status: 'todo',
      assignedTo: {
        name: 'Dr. Sarah Johnson',
      }
    },
    {
      id: 2,
      title: 'Review lab results for patient Mary Smith',
      type: 'Review',
      dueIn: 'Within 2 hours',
      status: 'todo',
      assignedTo: {
        name: 'Dr. Sarah Johnson',
      }
    },
    {
      id: 3,
      title: 'Conduct follow-up with James Wilson',
      type: 'Follow-up',
      dueIn: 'Within 3 hours',
      status: 'completed',
      assignedTo: {
        name: 'Dr. David Miller',
      }
    },
    {
      id: 4,
      title: 'Prepare referral for patient Emma Davis',
      type: 'Referral',
      dueIn: 'Within 4 hours',
      status: 'in-progress',
      assignedTo: {
        name: 'Dr. Sarah Johnson',
      }
    },
    {
      id: 5,
      title: 'Document treatment plan for Michael Brown',
      type: 'Documentation',
      dueIn: 'Within 5 hours',
      status: 'todo',
      assignedTo: {
        name: 'Dr. Sarah Johnson',
      }
    }
  ];

  // Function to start a task
  const startTask = (task: Task) => {
    // In a real app, this would be an API call
    setCurrentTask(task);
    toast({
      title: "Task Started",
      description: `You are now working on: ${task.title}`,
    });
  };

  // Function to complete a task
  const completeTask = (task: Task) => {
    // In a real app, this would be an API call
    if (currentTask?.id === task.id) {
      setCurrentTask(null);
    }
    toast({
      title: "Task Completed",
      description: `You have completed: ${task.title}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Here's what's happening in your practice today</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Total patients seen"
                value={MOCK_STATS.totalPatients.toString()}
                change="+4"
                icon={<Users className="h-6 w-6 text-blue-600" />}
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
              <StatsCard 
                title="Total consultations"
                value={MOCK_STATS.totalConsultations.toString()}
                change="+2"
                icon={<ClipboardCheck className="h-6 w-6 text-green-600" />}
                bgColor="bg-green-50"
                textColor="text-green-600"
              />
              <StatsCard 
                title="Patients waiting"
                value={MOCK_STATS.waitingPatients.toString()}
                icon={<Clock className="h-6 w-6 text-amber-600" />}
                bgColor="bg-amber-50"
                textColor="text-amber-600"
              />
              <StatsCard 
                title="Consultation progress"
                value={`${MOCK_STATS.consultationProgress}%`}
                icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
                bgColor="bg-purple-50"
                textColor="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Consultation */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Tasks</CardTitle>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <FileText className="h-4 w-4 mr-1" /> Export CSV
                        </Button>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Add New
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onStart={() => startTask(task)} 
                          onComplete={completeTask} 
                          isActive={currentTask?.id === task.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Moving Budget */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Current</p>
                        <p className="text-sm font-medium">Target</p>
                        <p className="text-sm font-medium">Remaining</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">5,000</p>
                        <p className="text-2xl font-bold">3,200</p>
                        <p className="text-2xl font-bold text-red-500">1,800</p>
                      </div>
                      
                      {/* Chart would go here */}
                      <div className="h-40 bg-gradient-to-r from-pink-100 to-pink-50 rounded-md flex items-center justify-center">
                        <p className="text-pink-800 text-sm">Chart visualization here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Moving Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-1">Label by Room</h4>
                      <p className="text-sm text-gray-600">Label boxes by room to make unpacking easier</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-1">👍</span> Organizer.com
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-1">Essentials Box</h4>
                      <p className="text-sm text-gray-600">Pack a separate box with essential items you'll need immediately after the move</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-1">👍</span> Organizer.com
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-1">Use Bubble Wrap</h4>
                      <p className="text-sm text-gray-600">Wrap fragile items in bubble wrap or use towels to avoid breakage</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-1">👍</span> Organizer.com
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Location Map */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Practice Locations</CardTitle>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span>Map by Google Maps</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Map would go here, for now just a placeholder */}
                <div className="h-64 bg-slate-100 rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-500">Interactive Map Here</p>
                  </div>
                  
                  {/* Map Pin Indicators */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    A
                  </div>
                  <div className="absolute bottom-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 
                       bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    B
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <LocationItem 
                    id={1}
                    name="Main Clinic" 
                    address="123 Oak Street, Springfield, IL" 
                    type="current"
                  />
                  <LocationItem 
                    id={2}
                    name="Satellite Office" 
                    address="789 Maple Avenue, San Francisco, CA" 
                    estimatedDate="November 14, 2024"
                    type="upcoming"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 py-10">Calendar content would be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 py-10">Documents content would be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, bgColor, textColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`${bgColor} p-3 rounded-full`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change && (
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                    {change}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Task Item Component
interface TaskItemProps {
  task: Task;
  onStart: () => void;
  onComplete: (task: Task) => void;
  isActive: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onStart, onComplete, isActive }) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${isActive ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={task.status === 'completed'} 
            onChange={() => {
              if (task.status !== 'completed') {
                onComplete(task);
              }
            }}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span>Type: {task.type}</span>
              <span className="mx-2">•</span>
              <span>{task.dueIn}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(task.status)}>
            {task.status === 'todo' ? 'To Do' : 
             task.status === 'in-progress' ? 'In Progress' : 
             'Completed'}
          </Badge>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-500 mr-2">
              {task.assignedTo.name}
            </div>
            <Avatar className="h-8 w-8">
              {task.assignedTo.image ? (
                <AvatarImage src={task.assignedTo.image} alt={task.assignedTo.name} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          {task.status !== 'completed' && (
            <Button 
              variant={isActive ? "default" : "outline"} 
              size="sm"
              onClick={onStart}
              className={isActive ? "bg-primary text-white" : ""}
            >
              {isActive ? (
                <>In Progress</>
              ) : (
                <>Start Task</>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Task</DropdownMenuItem>
              <DropdownMenuItem>Reassign</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

// Location Item Component
interface LocationItemProps {
  id: number;
  name: string;
  address: string;
  estimatedDate?: string;
  type: 'current' | 'upcoming';
}

const LocationItem: React.FC<LocationItemProps> = ({ id, name, address, estimatedDate, type }) => {
  return (
    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${type === 'current' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'} flex items-center justify-center font-medium mr-3`}>
          {type === 'current' ? 'A' : 'B'}
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-600">{address}</p>
          {estimatedDate && (
            <p className="text-xs text-gray-500 mt-1">Estimated arrival: {estimatedDate}</p>
          )}
        </div>
      </div>
      
      <div className="flex">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NewDoctorDashboard;