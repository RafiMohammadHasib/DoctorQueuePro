import React, { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().optional(),
  role: z.enum(['admin', 'doctor', 'receptionist', 'user']),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  
  // Create a validation schema based on whether it's an edit or create form
  const validationSchema = initialData
    ? userFormSchema
    : userFormSchema.extend({
        password: passwordSchema,
      });
  
  const defaultValues: UserFormValues = initialData
    ? {
        name: initialData.name,
        username: initialData.username,
        password: '',
        role: (initialData.role as 'admin' | 'doctor' | 'receptionist' | 'user') || 'user',
      }
    : {
        name: '',
        username: '',
        password: '',
        role: 'user',
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      return apiRequest('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been successfully added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user. The username may already be taken.",
        variant: "destructive",
      });
      console.error("Failed to create user:", error);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      
      return apiRequest(`/api/users/${initialData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update user:", error);
    }
  });

  const onSubmit = (data: UserFormValues) => {
    if (initialData) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                Used for login to the system
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {initialData ? 'New Password (leave blank to keep current)' : 'Password'}
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    {...field} 
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {initialData && (
                <FormDescription>
                  Leave blank to keep the current password
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>User Role</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Administrator
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="doctor" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Doctor
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="receptionist" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Receptionist
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="user" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Regular User
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                The role determines the user's permissions in the system
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
                ? 'Update User' 
                : 'Add User'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;