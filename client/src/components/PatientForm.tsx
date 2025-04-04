import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Patient } from '@shared/schema';

// Form validation schema
const patientFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Age must be a positive number',
  }),
  gender: z.string().optional(),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  appointmentType: z.enum(['new', 'followup', 'urgent']),
  isPriority: z.boolean().default(false),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  doctorId: number;
  queueId?: number;
}

const PatientForm: React.FC<PatientFormProps> = ({ doctorId, queueId }) => {
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Get doctor's queue if not provided
  const { data: doctorQueue } = useQuery({
    queryKey: ['/api/doctors', doctorId, 'queue'],
    enabled: !!doctorId && !queueId,
  });

  const activeQueueId = queueId || doctorQueue?.id;

  // Initialize form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      phoneNumber: '',
      email: '',
      appointmentType: 'new',
      isPriority: false,
    },
  });

  // Search for existing patient by phone number
  const searchPatient = async (phoneNumber: string) => {
    if (phoneNumber.length < 10) return;
    
    setIsSearching(true);
    try {
      // In a real app, this would be an API call to search for a patient
      // Since we're using in-memory storage, we'll simulate this by creating a new patient if not found
      
      // We'll check if we already have a patient on the form that matches
      if (existingPatient && existingPatient.phoneNumber === phoneNumber) {
        return;
      }
      
      // For now, we'll clear any existing patient data
      setExistingPatient(null);
      form.setValue('name', '');
      form.setValue('age', '');
      form.setValue('gender', '');
      form.setValue('email', '');
      
      // In a production app, this would be:
      // const response = await fetch(`/api/patients/search?phoneNumber=${phoneNumber}`);
      // const patient = await response.json();
      // if (patient) {
      //   setExistingPatient(patient);
      //   form.setValue('name', patient.name);
      //   form.setValue('age', patient.age.toString());
      //   form.setValue('gender', patient.gender || '');
      //   form.setValue('email', patient.email || '');
      // }
    } catch (error) {
      console.error('Error searching for patient:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      // Create or update patient
      const patientData = {
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
      };
      
      const response = await apiRequest('POST', '/api/patients', patientData);
      return response.json();
    },
  });

  // Add patient to queue mutation
  const addToQueueMutation = useMutation({
    mutationFn: async (data: { patientId: number, formData: PatientFormValues }) => {
      if (!activeQueueId) {
        throw new Error('Queue not found');
      }
      
      const queueItemData = {
        patientId: data.patientId,
        appointmentType: data.formData.appointmentType,
        priorityLevel: data.formData.isPriority 
          ? 'priority' 
          : data.formData.appointmentType === 'urgent' ? 'urgent' : 'normal',
      };
      
      const response = await apiRequest('POST', `/api/queues/${activeQueueId}/add-patient`, queueItemData);
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      setExistingPatient(null);
      
      // Invalidate queries to update UI
      if (activeQueueId) {
        queryClient.invalidateQueries({ queryKey: ['/api/queues', activeQueueId] });
        queryClient.invalidateQueries({ queryKey: ['/api/doctors', doctorId, 'queue'] });
      }
      
      toast({
        title: 'Success',
        description: 'Patient added to queue successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding patient to queue',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = async (data: PatientFormValues) => {
    try {
      // If we already have a patient record, use it
      if (existingPatient) {
        addToQueueMutation.mutate({
          patientId: existingPatient.id,
          formData: data
        });
      } else {
        // Create new patient and add to queue
        const patient = await createPatientMutation.mutateAsync(data);
        addToQueueMutation.mutate({
          patientId: patient.id,
          formData: data
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add patient to queue',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          searchPatient(e.target.value);
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => searchPatient(field.value)}
                      disabled={isSearching || field.value.length < 10}
                    >
                      Search
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input placeholder="Age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        {...field}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md cursor-pointer data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary-700">
                        <RadioGroupItem 
                          value="new" 
                          id="typeNewVisit" 
                          className="sr-only" 
                        />
                        <Label 
                          htmlFor="typeNewVisit"
                          className="cursor-pointer w-full text-center"
                        >
                          New Visit
                        </Label>
                      </div>
                      <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md cursor-pointer data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary-700">
                        <RadioGroupItem 
                          value="followup" 
                          id="typeFollowUp" 
                          className="sr-only" 
                        />
                        <Label 
                          htmlFor="typeFollowUp"
                          className="cursor-pointer w-full text-center"
                        >
                          Follow-up
                        </Label>
                      </div>
                      <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md cursor-pointer data-[state=checked]:border-red-500 data-[state=checked]:bg-red-50 data-[state=checked]:text-red-700">
                        <RadioGroupItem 
                          value="urgent" 
                          id="typeUrgent" 
                          className="sr-only" 
                        />
                        <Label 
                          htmlFor="typeUrgent"
                          className="cursor-pointer w-full text-center"
                        >
                          Urgent
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPriority"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="priorityCheck"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="priorityCheck">
                      Mark as priority patient
                    </FormLabel>
                    <p className="text-sm text-gray-500">
                      Priority patients will be moved ahead in the queue based on their needs.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setExistingPatient(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPatientMutation.isPending || addToQueueMutation.isPending}
              >
                {createPatientMutation.isPending || addToQueueMutation.isPending 
                  ? 'Adding...' 
                  : 'Add to Queue'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;
