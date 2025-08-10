import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, Crown, UserCheck, User as UserIcon, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

const roleIcons = {
  admin: Crown,
  portfolio_manager: Shield,
  program_manager: UserCheck,
  project_manager: UserIcon,
  contributor: UsersIcon,
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  portfolio_manager: 'bg-blue-100 text-blue-800',
  program_manager: 'bg-green-100 text-green-800',
  project_manager: 'bg-yellow-100 text-yellow-800',
  contributor: 'bg-gray-100 text-gray-800',
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // In a real application, you would have a users endpoint
  // For now, we'll simulate this with the current user and search functionality
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    queryFn: () => searchQuery ? fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()) : Promise.resolve([]),
    enabled: searchQuery.length > 0,
  });

  const updateUserRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update user role');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const getUserInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRole.mutate({ userId, role: newRole });
  };

  const allUsers = [
    ...(currentUser ? [currentUser] : []),
    ...searchResults,
  ];

  // Remove duplicates based on ID
  const uniqueUsers = allUsers.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-600">Manage users and their roles within the system</p>
            </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Users
          </CardTitle>
          <CardDescription>
            Search for users by name or email to view or modify their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-user-search"
            />
          </div>
        </CardContent>
      </Card>

      {uniqueUsers.length > 0 ? (
        <div className="grid gap-4">
          {uniqueUsers.map((user: any) => {
            const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || UserIcon;
            
            return (
              <Card key={user.id} data-testid={`card-user-${user.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.profileImageUrl} alt={user.email} />
                        <AvatarFallback>
                          {getUserInitials(user.firstName, user.lastName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-slate-900" data-testid={`text-name-${user.id}`}>
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </h3>
                        <p className="text-sm text-slate-600" data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge 
                        className={roleColors[user.role as keyof typeof roleColors]}
                        data-testid={`badge-role-${user.id}`}
                      >
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {user.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      
                      {currentUser?.role === 'admin' && user.id !== currentUser?.id && (
                        <Select 
                          value={user.role} 
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-48" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                            <SelectItem value="program_manager">Program Manager</SelectItem>
                            <SelectItem value="project_manager">Project Manager</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {user.id === currentUser?.id && (
                        <span className="text-sm text-slate-500">(You)</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : searchQuery ? (
        searchLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                <p className="text-slate-600">Try searching with a different name or email.</p>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Search for users</h3>
              <p className="text-slate-600">Enter a name or email above to find and manage users.</p>
            </div>
          </CardContent>
        </Card>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}