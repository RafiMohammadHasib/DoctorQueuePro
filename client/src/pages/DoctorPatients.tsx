import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, FilterX } from 'lucide-react';

const DoctorPatients: React.FC = () => {
  // For demo purposes, hard-coded doctor ID
  const doctorId = 1;

  // Mock data for patients
  const patients = [
    { id: 1, name: 'John Smith', age: 45, phoneNumber: '555-123-4567', lastVisit: '2025-03-15', visits: 3 },
    { id: 2, name: 'Maria Garcia', age: 32, phoneNumber: '555-987-6543', lastVisit: '2025-03-20', visits: 1 },
    { id: 3, name: 'Robert Johnson', age: 58, phoneNumber: '555-456-7890', lastVisit: '2025-02-28', visits: 5 },
    { id: 4, name: 'Sarah Williams', age: 27, phoneNumber: '555-789-0123', lastVisit: '2025-03-25', visits: 2 },
    { id: 5, name: 'David Brown', age: 41, phoneNumber: '555-234-5678', lastVisit: '2025-03-10', visits: 4 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DoctorSidebar waitingCount={0} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-500">View and manage your patients</p>
          </div>
          
          {/* Search and Filter Section */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search patients by name, phone..."
                    className="pl-8 pr-4 py-2 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-1">
                    <FilterX className="h-4 w-4" />
                    Filters
                  </Button>
                  <Button className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Add New Patient
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient List */}
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <CardDescription>
                Total of {patients.length} patients under your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Patients</TabsTrigger>
                  <TabsTrigger value="recent">Recent Patients</TabsTrigger>
                  <TabsTrigger value="frequent">Frequent Visitors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Age
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Visit
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Visits
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">{patient.name.charAt(0)}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.age}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.phoneNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.lastVisit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.visits}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" className="text-primary-600 hover:text-primary-900">
                                View
                              </Button>
                              <Button variant="ghost" className="text-primary-600 hover:text-primary-900">
                                History
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="recent" className="mt-4">
                  <div className="text-center py-10">
                    <p className="text-gray-500">This section will show patients from the past 30 days</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="frequent" className="mt-4">
                  <div className="text-center py-10">
                    <p className="text-gray-500">This section will show patients with 3+ visits</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;