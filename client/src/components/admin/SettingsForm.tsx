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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const systemSettingsSchema = z.object({
  clinicName: z.string().min(2, { message: 'Clinic name is required' }),
  clinicAddress: z.string().min(5, { message: 'Please provide a valid address' }),
  contactNumber: z.string().min(5, { message: 'Contact number is required' }),
  contactEmail: z.string().email({ message: 'Please provide a valid email address' }),
  enableSmsNotifications: z.boolean().default(false),
  enableEmailNotifications: z.boolean().default(false),
  defaultConsultationTime: z.coerce.number().int().min(1).max(120),
  welcomeMessage: z.string().max(500, { message: 'Welcome message is too long' }).optional(),
});

type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;

const SettingsForm: React.FC = () => {
  const { toast } = useToast();

  const defaultValues: SystemSettingsFormValues = {
    clinicName: 'Medical Clinic',
    clinicAddress: '123 Healthcare Avenue, Medical City',
    contactNumber: '+1 555-123-4567',
    contactEmail: 'contact@medicalclinic.com',
    enableSmsNotifications: true,
    enableEmailNotifications: true,
    defaultConsultationTime: 15,
    welcomeMessage: 'Welcome to our clinic. We are committed to providing you with the best possible healthcare services.',
  };

  const form = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues,
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: SystemSettingsFormValues) => {
      return apiRequest('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your system settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update settings:", error);
    }
  });

  const onSubmit = (data: SystemSettingsFormValues) => {
    settingsMutation.mutate(data);
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="queue">Queue Settings</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TabsContent value="general" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>
                  Basic information about your clinic that appears on patient-facing interfaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This name will be displayed on all patient-facing screens
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinicAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter a welcome message for patients"
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be displayed on the reception kiosk screen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how patients receive notifications about their queue status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableSmsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>
                          Enable SMS notifications for patients about their queue status
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
                  name="enableEmailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Enable email notifications for patients about their queue status
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Management Settings</CardTitle>
                <CardDescription>
                  Configure default settings for queue management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultConsultationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Consultation Time (minutes)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={1} max={120} />
                      </FormControl>
                      <FormDescription>
                        This is the default time allocated for each patient consultation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={settingsMutation.isPending}
              className="w-full sm:w-auto"
            >
              {settingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
};

export default SettingsForm;