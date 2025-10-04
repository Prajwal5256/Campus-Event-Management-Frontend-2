import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'club_admin' | 'college_admin';
  clubs: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('campusEventUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call your backend API
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'student@college.edu',
        role: 'student' as const,
        clubs: ['club1', 'club2']
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'clubadmin@college.edu',
        role: 'club_admin' as const,
        clubs: ['club1']
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@college.edu',
        role: 'college_admin' as const,
        clubs: []
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('campusEventUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    // Mock registration
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      clubs: userData.clubs || []
    };
    setUser(newUser);
    localStorage.setItem('campusEventUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusEventUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}