import React, { useState, useEffect } from 'react';
import { Doctor, QueueItemWithPatient, QueueStats } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Pause, X, Clock, Phone, UserRound } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface DoctorControlsProps {
  doctor: Doctor;
  currentPatient?: QueueItemWithPatient;
  stats?: QueueStats;
  isAvailable: boolean;
  onCallNext: () => void;
  onCompleteConsultation: () => void;
  onCancelConsultation: () => void;
  onToggleAvailability: () => void;
  isPending: boolean;
}

const DoctorControls: React.FC<DoctorControlsProps> = ({
  doctor,
  currentPatient,
  stats,
  isAvailable,
  onCallNext,
  onCompleteConsultation,
  onCancelConsultation,
  onToggleAvailability,
  isPending
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time for current patient
  useEffect(() => {
    if (!currentPatient || !currentPatient.startTime) return;
    
    const updateElapsed = () => {
      const startTime = new Date(currentPatient.startTime!);
      const elapsed = formatDistanceToNowStrict(startTime, { addSuffix: false });
      setElapsedTime(elapsed);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [currentPatient]);

  return (
    <Card className="shadow mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{doctor.name}</h2>
            <p className="text-gray-600">{doctor.specialization} • Room {doctor.roomNumber}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={isAvailable} 
                onCheckedChange={onToggleAvailability}
                id="statusToggle"
              />
              <span className={isAvailable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center">
              <Clock className="text-primary-500 h-4 w-4 mr-2" />
              <span className="font-mono">{currentTime}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Patients Seen Today</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-primary-500">
                {stats?.patientsSeen || 0}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                /{stats?.totalPatients || 0} scheduled
              </span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-500 mb-1">Average Wait Time</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-green-600">
                {stats?.averageWaitTime || 0}
              </span>
              <span className="text-sm text-gray-500 ml-2">minutes</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-sm text-gray-500 mb-1">Avg. Consultation Time</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-amber-600">
                {stats?.averageConsultTime || 0}
              </span>
              <span className="text-sm text-gray-500 ml-2">minutes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <Button
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg flex items-center"
            onClick={onCallNext}
            disabled={isPending || !!currentPatient}
          >
            <UserRound className="mr-2 h-5 w-5" />
            Call Next Patient
          </Button>
        </div>

        {/* Current Patient Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Current Patient</h3>
              {currentPatient ? (
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">{currentPatient.patient.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {currentPatient.patient.age} yrs
                      {currentPatient.patient.gender && ` • ${currentPatient.patient.gender}`}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      currentPatient.appointmentType === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : currentPatient.appointmentType === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary-100 text-primary-700'
                    }`}>
                      {currentPatient.appointmentType === 'new' 
                        ? 'First Visit' 
                        : currentPatient.appointmentType === 'urgent'
                          ? 'Urgent'
                          : 'Follow-up'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="text-gray-400 h-4 w-4 mr-1" />
                    <span>{elapsedTime}</span>
                    <span className="mx-2">•</span>
                    <Phone className="text-gray-400 h-4 w-4 mr-1" />
                    <span>{currentPatient.patient.phoneNumber}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-gray-500 italic">
                  No patient in consultation
                </div>
              )}
            </div>
            {currentPatient && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={onCompleteConsultation}
                  disabled={isPending}
                  title="Complete Consultation"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 text-amber-500 border-amber-200 hover:bg-amber-50"
                  disabled={isPending}
                  title="Pause Consultation"
                >
                  <Pause className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={onCancelConsultation}
                  disabled={isPending}
                  title="Cancel Consultation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorControls;
