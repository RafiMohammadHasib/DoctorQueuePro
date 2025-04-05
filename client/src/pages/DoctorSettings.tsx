import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

const DoctorSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // For demo purposes
  const doctorId = 1;
  
  // Mock doctor profile data
  const doctorProfile = {
    id: doctorId,
    name: 'Dr. Sarah Johnson',
    email: 'drjohnson@example.com',
    phoneNumber: '555-123-4567',
    specialization: 'General Medicine',
    roomNumber: '203',
    bio: 'Board-certified general practitioner with over 10 years of experience in primary care and preventive medicine.',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    consultationDuration: 15, // minutes
    notificationsEnabled: true,
    appointmentReminders: true
  };
  
  // Mock save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      // This would normally call an API endpoint
      console.log('Saving profile data:', profileData);
      return profileData;
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(doctorProfile);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DoctorSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">Manage your account and preferences</p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <form onSubmit={handleSaveProfile}>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile information visible to staff and patients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          defaultValue={doctorProfile.name} 
                          placeholder="Dr. Full Name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input 
                          id="specialization" 
                          defaultValue={doctorProfile.specialization} 
                          placeholder="e.g. Cardiology, Pediatrics" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={doctorProfile.email} 
                          placeholder="email@example.com" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          defaultValue={doctorProfile.phoneNumber} 
                          placeholder="(555) 123-4567" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input 
                          id="roomNumber" 
                          defaultValue={doctorProfile.roomNumber} 
                          placeholder="e.g. 101" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultationDuration">Consultation Duration (minutes)</Label>
                        <Input 
                          id="consultationDuration" 
                          type="number" 
                          defaultValue={doctorProfile.consultationDuration.toString()} 
                          min="5"
                          max="60"
                          step="5"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue={doctorProfile.bio} 
                        placeholder="Write a short bio about your professional background" 
                        rows={4} 
                      />
                      <p className="text-xs text-gray-500">This information will be displayed on your public profile.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 border-t p-4">
                    <Button variant="outline">Cancel</Button>
                    <Button type="submit" disabled={saveProfileMutation.isPending}>
                      {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account credentials and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter your current password" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        placeholder="Enter new password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="Confirm new password" 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Delete Account
                  </Button>
                  <Button>
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Patient Arrival Notifications</h3>
                        <p className="text-xs text-gray-500">Get notified when a patient checks in</p>
                      </div>
                      <Switch defaultChecked={doctorProfile.notificationsEnabled} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Queue Updates</h3>
                        <p className="text-xs text-gray-500">Get notified about changes to your patient queue</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Appointment Reminders</h3>
                        <p className="text-xs text-gray-500">Receive reminders for upcoming appointments</p>
                      </div>
                      <Switch defaultChecked={doctorProfile.appointmentReminders} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">System Announcements</h3>
                        <p className="text-xs text-gray-500">Receive updates about system maintenance and new features</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                  <Button>
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Schedule</CardTitle>
                  <CardDescription>
                    Set your weekly availability for appointments and consultations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(doctorProfile.availability).map(([day, available]) => (
                      <div key={day} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <h3 className="text-sm font-medium capitalize">{day}</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch defaultChecked={available} id={`${day}-available`} />
                            <Label htmlFor={`${day}-available`}>Available</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              defaultValue="09:00"
                              className="w-24"
                              disabled={!available}
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              defaultValue="17:00"
                              className="w-24"
                              disabled={!available}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                  <Button>
                    Save Schedule
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;