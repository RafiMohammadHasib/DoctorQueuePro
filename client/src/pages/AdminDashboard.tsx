import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Settings, Activity, Users, User, Clipboard } from 'lucide-react';
import DoctorsList from '@/components/admin/DoctorsList';
import UsersList from '@/components/admin/UsersList';
import PatientsList from '@/components/admin/PatientsList';
import StatisticsOverview from '@/components/admin/StatisticsOverview';
import SettingsForm from '@/components/admin/SettingsForm';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage doctors, patients, users, and system settings</p>
      </div>

      <Tabs defaultValue="doctors" className="space-y-6">
        <div className="sticky top-0 z-10 bg-white pb-2">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="doctors" className="flex items-center justify-center">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Doctors</span>
              <span className="md:hidden">Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center justify-center">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Patients</span>
              <span className="md:hidden">Patients</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center">
              <Activity className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Statistics</span>
              <span className="md:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Users</span>
              <span className="md:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
              <span className="md:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <DoctorsList />
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <PatientsList />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <StatisticsOverview />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersList />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-4xl mx-auto">
            <SettingsForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
