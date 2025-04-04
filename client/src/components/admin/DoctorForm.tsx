import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Doctor, User } from '@shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

const doctorFormSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  specialization: z.string().min(2, { message: 'Specialization is required' }),
  roomNumber: z.string().min(1, { message: 'Room number is required' }),
  isAvailable: z.boolean().default(true),
  userId: z.number().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  initialData?: Doctor;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const defaultValues: DoctorFormValues = initialData || {
    name: '',
    specialization: '',
    roomNumber: '',
    isAvailable: true,
    userId: undefined,
  };

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues,
  });

  // Fetch users for doctor association
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (data: DoctorFormValues) => {
      return apiRequest('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Doctor created",
        description: "The doctor has been successfully added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create doctor. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create doctor:", error);
    }
  });

  const updateDoctorMutation = useMutation({
    mutationFn: async (data: DoctorFormValues) => {
      return apiRequest(`/api/doctors/${initialData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Doctor updated",
        description: "The doctor information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update doctor. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update doctor:", error);
    }
  });

  const onSubmit = (data: DoctorFormValues) => {
    if (initialData) {
      updateDoctorMutation.mutate(data);
    } else {
      createDoctorMutation.mutate(data);
    }
  };

  const isPending = createDoctorMutation.isPending || updateDoctorMutation.isPending;

  // Filter users with role 'doctor'
  const doctorUsers = users?.filter(user => 
    user.role?.toLowerCase() === 'doctor' || !user.role
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. Jane Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="Cardiology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Availability Status</FormLabel>
                <FormDescription>
                  Set the doctor as available to accept patients
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated User Account</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {doctorUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Link the doctor to a system user account for login access
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending 
              ? 'Saving...' 
              : initialData 
                ? 'Update Doctor' 
                : 'Add Doctor'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DoctorForm;