import React, { useState, useEffect } from 'react';
import { Doctor, QueueItemWithPatient, QueueStats } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Pause, X, Clock, Phone, UserRound, Clipboard, HeartPulse, FileText } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-t-4 border-t-primary rounded-lg overflow-hidden mb-6">
        <CardContent className="p-6">
          <motion.div 
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {doctor.name}
              </h2>
              <p className="text-gray-600">{doctor.specialization} • Room {doctor.roomNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isAvailable} 
                  onCheckedChange={onToggleAvailability}
                  id="statusToggle"
                />
                <span className={`font-medium ${isAvailable 
                  ? 'text-green-600' 
                  : 'text-red-500'}`}>
                  {isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
              <motion.div 
                className="bg-gray-100 px-4 py-2 rounded-lg flex items-center shadow-sm"
                animate={{ 
                  boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 8px rgba(0,0,0,0.1)", "0px 0px 0px rgba(0,0,0,0)"] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  repeatType: "loop"
                }}
              >
                <Clock className="text-primary h-4 w-4 mr-2" />
                <span className="font-mono">{currentTime}</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center mb-1">
                <Clipboard className="h-4 w-4 text-blue-600 mr-1" />
                <p className="text-sm font-medium text-blue-700">Patients Seen Today</p>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-primary">
                  {stats?.patientsSeen || 0}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  /{stats?.totalPatients || 0} scheduled
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-green-600 mr-1" />
                <p className="text-sm font-medium text-green-700">Average Wait Time</p>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-green-600">
                  {stats?.averageWaitTime || 0}
                </span>
                <span className="text-sm text-gray-500 ml-2">minutes</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center mb-1">
                <HeartPulse className="h-4 w-4 text-amber-600 mr-1" />
                <p className="text-sm font-medium text-amber-700">Avg. Consultation Time</p>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-amber-600">
                  {stats?.averageConsultTime || 0}
                </span>
                <span className="text-sm text-gray-500 ml-2">minutes</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              className={`${isPending || !!currentPatient 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-blue-600 hover:opacity-90'} 
                text-white font-medium py-6 px-8 rounded-lg flex items-center shadow-md`}
              onClick={onCallNext}
              disabled={isPending || !!currentPatient}
              size="lg"
            >
              <UserRound className="mr-2 h-5 w-5" />
              Call Next Patient
            </Button>
          </motion.div>

          {/* Current Patient Card */}
          <motion.div 
            className={`${currentPatient 
              ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
              : 'bg-gray-50'} 
              border ${currentPatient ? 'border-blue-200' : 'border-gray-200'} 
              rounded-lg p-6 shadow-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Current Patient
                </h3>
                {currentPatient ? (
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-gray-800 text-lg">{currentPatient.patient.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {currentPatient.patient.age} yrs
                        {currentPatient.patient.gender && ` • ${currentPatient.patient.gender}`}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
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
                    <div className="flex items-center text-sm text-gray-600 bg-white p-2 rounded-md shadow-sm">
                      <Clock className="text-primary h-4 w-4 mr-1" />
                      <span className="font-medium">{elapsedTime}</span>
                      <span className="mx-2">•</span>
                      <Phone className="text-primary h-4 w-4 mr-1" />
                      <span>{currentPatient.patient.phoneNumber}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-3 bg-white p-4 rounded-md shadow-sm text-gray-500 italic flex items-center">
                    <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                    No patient in consultation
                  </div>
                )}
              </div>
              {currentPatient && (
                <motion.div 
                  className="flex space-x-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-11 w-11 text-green-600 border-green-300 hover:bg-green-50 shadow-sm hover:shadow transition-all duration-300"
                    onClick={onCompleteConsultation}
                    disabled={isPending}
                    title="Complete Consultation"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-11 w-11 text-amber-500 border-amber-300 hover:bg-amber-50 shadow-sm hover:shadow transition-all duration-300"
                    disabled={isPending}
                    title="Pause Consultation"
                  >
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-11 w-11 text-red-500 border-red-300 hover:bg-red-50 shadow-sm hover:shadow transition-all duration-300"
                    onClick={onCancelConsultation}
                    disabled={isPending}
                    title="Cancel Consultation"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorControls;
