import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, MoreHorizontal, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import UserFormModal from '@/components/admin/UserFormModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';

// Role styling config
const roleConfig = {
  admin: {
    icon: <Shield className="h-4 w-4 mr-1" />,
    variant: 'destructive' as const,
    label: 'Administrator'
  },
  doctor: {
    icon: <User className="h-4 w-4 mr-1" />,
    variant: 'default' as const,
    label: 'Doctor'
  },
  receptionist: {
    icon: <User className="h-4 w-4 mr-1" />,
    variant: 'secondary' as const,
    label: 'Receptionist'
  },
  user: {
    icon: <User className="h-4 w-4 mr-1" />,
    variant: 'outline' as const,
    label: 'Regular User'
  }
};

const UsersPage: React.FC = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock query for user data
  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your API
      // and include proper error handling
      return [
        { id: 1, fullName: 'Admin User', username: 'admin', role: 'admin' },
        { id: 2, fullName: 'Dr. Sarah Johnson', username: 'sjohnson', role: 'doctor' },
        { id: 3, fullName: 'Jane Smith', username: 'jsmith', role: 'receptionist' },
        { id: 4, fullName: 'Regular User', username: 'user1', role: 'user' }
      ];
    }
  });

  const handleAddUserSuccess = () => {
    toast({
      title: "User created successfully",
      description: "The new user can now log in to the system",
      variant: "default"
    });
  };

  const handleDeleteUser = (id: number) => {
    // In a real implementation, this would call your API
    toast({
      title: "User deleted",
      description: "The user has been removed from the system",
      variant: "default"
    });
  };

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Error dismissal function
  const dismissError = () => setError(null);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowAddUserModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>System Users</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, username, or role..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load users. Please try again.</p>
              <Button variant="outline" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => {
                    const roleInfo = roleConfig[user.role as keyof typeof roleConfig];
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.fullName}</span>
                            <span className="text-muted-foreground text-sm">@{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleInfo.variant} className="flex items-center w-fit">
                            {roleInfo.icon}
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddUserModal && (
        <UserFormModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSuccess={handleAddUserSuccess}
        />
      )}

      {/* Error message */}
      {error && (
        <ErrorMessage 
          message={error}
          onDismiss={dismissError}
        />
      )}
    </div>
  );
};

export default UsersPage;