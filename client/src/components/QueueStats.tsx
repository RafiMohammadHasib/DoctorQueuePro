import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { QueueStats as QueueStatsType } from '@shared/schema';

interface QueueStatsProps {
  doctorId: number;
}

const QueueStats: React.FC<QueueStatsProps> = ({ doctorId }) => {
  const { data: stats, isLoading } = useQuery<QueueStatsType>({
    queryKey: ['/api/doctors', doctorId, 'stats'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-20">
            <div className="text-center">
              <svg className="animate-spin h-6 w-6 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4 text-gray-500">
            No statistics available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-gray-500">Patients Seen</p>
            <p className="text-lg font-semibold text-primary-500">{stats.patientsSeen}</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-md">
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-lg font-semibold text-green-600">{stats.totalPatients}</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-md">
            <p className="text-xs text-gray-500">Avg. Wait</p>
            <p className="text-lg font-semibold text-amber-600">{stats.averageWaitTime} min</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-md">
            <p className="text-xs text-gray-500">Avg. Consult</p>
            <p className="text-lg font-semibold text-purple-600">{stats.averageConsultTime} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueStats;
