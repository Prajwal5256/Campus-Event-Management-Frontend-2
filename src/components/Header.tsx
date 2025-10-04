import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Calendar, LogOut, User, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'club_admin': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'college_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'club_admin': return 'Club Admin';
      case 'college_admin': return 'College Admin';
      default: return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">Campus Events</h1>
          </div>
          <Badge className={getRoleBadgeColor(user?.role || '')}>
            {getRoleDisplayName(user?.role || '')}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'club_admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/create-event')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${user?.role?.replace('_', '-')}`)}>
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}