import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Doctor, Patient, QueueStats as QueueStatsType } from '@shared/schema';
import { Users, Clock, Calendar, BarChart } from 'lucide-react';
import DoctorQueueStats from '@/components/QueueStats';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SystemStatsData {
  totalDoctors: number;
  totalPatients: number;
  activeQueues: number;
  avgWaitTime: number;
  avgConsultTime: number;
  dailyPatients: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary-100 p-1.5 text-primary-600">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const StatisticsOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  // Fetch doctors and patients
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  // Fetch system stats
  const { data: systemStats, isLoading: isLoadingStats } = useQuery<SystemStatsData>({
    queryKey: ['/api/stats', timeRange],
    queryFn: async () => {
      // If the API for stats isn't available yet, return simulated data
      return {
        totalDoctors: doctors?.length || 0,
        totalPatients: patients?.length || 0,
        activeQueues: doctors?.filter(d => d.isAvailable).length || 0,
        avgWaitTime: 15, // minutes
        avgConsultTime: 12, // minutes
        dailyPatients: patients?.length || 0,
      };
    },
    enabled: !!doctors && !!patients
  });

  const isLoading = isLoadingDoctors || isLoadingPatients || isLoadingStats;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="mb-4 text-primary-500">
            <svg className="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Overview</h2>
        
        <Select 
          defaultValue={timeRange} 
          onValueChange={(value) => setTimeRange(value as 'today' | 'week' | 'month')}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Doctors" 
          value={systemStats?.totalDoctors || 0}
          icon={<Users className="h-full w-full" />}
        />
        <StatCard 
          title="Total Patients" 
          value={systemStats?.totalPatients || 0} 
          icon={<Users className="h-full w-full" />}
        />
        <StatCard 
          title="Average Wait Time" 
          value={`${systemStats?.avgWaitTime || 0} min`} 
          icon={<Clock className="h-full w-full" />}
          description="Average time patients wait to be seen"
        />
        <StatCard 
          title="Average Consultation" 
          value={`${systemStats?.avgConsultTime || 0} min`} 
          icon={<Clock className="h-full w-full" />}
          description="Average time spent with each patient"
        />
      </div>

      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Doctors Performance</TabsTrigger>
          <TabsTrigger value="queues">Queue Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="doctors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doctors?.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{doctor.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <CardDescription>
                    {doctor.specialization || 'General Practice'} • Room {doctor.roomNumber || 'TBD'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DoctorQueueStats doctorId={doctor.id} />
                </CardContent>
              </Card>
            ))}
            
            {(!doctors || doctors.length === 0) && (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">No doctors available to show statistics</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="queues">
          <Card>
            <CardHeader>
              <CardTitle>Queue Analytics</CardTitle>
              <CardDescription>
                Analysis of queue performance and waiting times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Queue analytics visualization would be displayed here</p>
                  <p className="text-xs mt-2">Historical data and trends for patient wait times and throughput</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsOverview;