import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormError from '@/components/ui/FormError';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Form schema
const userFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "doctor", "receptionist", "user"])
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
      role: 'user'
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest('POST', '/api/users', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      form.reset();
      setServerError(null);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      if (error.message.includes('already') || error.message.includes('taken')) {
        setServerError('Username already exists. Please choose a different username.');
      } else {
        setServerError(error.message || 'An unexpected error occurred');
      }
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    setServerError(null);
    createUserMutation.mutate(data);
  });

  const roleOptions = [
    { value: 'admin', label: 'Administrator', description: 'Full access to all system features' },
    { value: 'doctor', label: 'Doctor', description: 'Access to patients and queue management' },
    { value: 'receptionist', label: 'Receptionist', description: 'Patient registration and queue management' },
    { value: 'user', label: 'Regular User', description: 'Basic access to the system' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate permissions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {serverError && <FormError message={serverError} />}
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" autoComplete="name" />
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
                    <Input {...field} placeholder="johndoe" autoComplete="username" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for login to the system
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        {...field} 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>User Role</FormLabel>
                  <p className="text-xs text-muted-foreground mb-2">
                    This role determines the user's permissions in the system
                  </p>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {roleOptions.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={role.value} id={`role-${role.value}`} />
                          <Label 
                            htmlFor={`role-${role.value}`}
                            className="flex items-center cursor-pointer"
                          >
                            <span className="font-medium">{role.label}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-2 text-xs text-muted-foreground">ℹ️</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{role.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating...
                  </>
                ) : (
                  'Add User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;