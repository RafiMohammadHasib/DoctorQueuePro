import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PatientForm from '@/components/PatientForm';
import QueueDisplay from '@/components/QueueDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Doctor, Queue } from '@shared/schema';

const ReceptionKiosk: React.FC = () => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  // Fetch all doctors
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  // Fetch queue for selected doctor
  const { data: doctorQueue, isLoading: isLoadingQueue } = useQuery({
    queryKey: ['/api/doctors', selectedDoctorId, 'queue'],
    enabled: !!selectedDoctorId,
  });

  if (isLoadingDoctors) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-primary-500">
            <svg className="animate-spin h-12 w-12 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600">Loading reception kiosk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reception Kiosk</h1>
        <p className="text-gray-600">Register patients and manage queues</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Select Doctor</CardTitle>
            <CardDescription>Choose a doctor to view their queue or add patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {doctors?.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctorId(doctor.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center
                    ${selectedDoctorId === doctor.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <span>{doctor.name}</span>
                  <span className={`ml-2 w-3 h-3 rounded-full ${
                    doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedDoctorId && (
        <Tabs defaultValue="register" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Register Patient</TabsTrigger>
            <TabsTrigger value="queue">View Queue</TabsTrigger>
          </TabsList>
          <TabsContent value="register" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Patient to Queue</CardTitle>
                <CardDescription>
                  Register a new patient or add an existing patient to the queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientForm doctorId={selectedDoctorId} queueId={doctorQueue?.id} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="queue" className="mt-4">
            {doctorQueue && (
              <QueueDisplay
                queue={doctorQueue}
                isLoading={isLoadingQueue}
                displayMode="reception"
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReceptionKiosk;
