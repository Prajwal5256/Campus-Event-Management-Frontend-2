import React, { useState, createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Users, Shield, Settings, BarChart3, Clock } from 'lucide-react';

// --- Placeholder UI Primitives (To resolve import errors) ---

// Placeholder toast function
const toast = {
  success: (message: string) => console.log(`Toast Success: ${message}`),
  error: (message: string) => console.error(`Toast Error: ${message}`),
};

// Placeholder Toaster component
const Toaster = () => <div className="hidden"></div>;

// --- 1. Custom UI Components (Mimicking Shadcn/Tailwind style) ---

// Button Component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'default' | 'outline' | 'ghost'; 
    size?: 'default' | 'sm' 
}> = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
    let baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    if (size === 'default') {
        baseStyle += " h-10 px-4 py-2 text-base";
    } else if (size === 'sm') {
        baseStyle += " h-8 px-3 text-sm";
    }

    if (variant === 'default') {
        baseStyle += " bg-indigo-600 text-white hover:bg-indigo-700 shadow-md";
    } else if (variant === 'outline') {
        baseStyle += " border border-gray-300 bg-white text-gray-700 hover:bg-gray-100";
    } else if (variant === 'ghost') {
        baseStyle += " hover:bg-gray-100 text-gray-700";
    }

    return (
        <button className={`${baseStyle} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Input Component
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

// Textarea Component
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

// Label Component
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
    <label className={`text-sm font-medium leading-none text-gray-700 ${className}`} {...props}>
        {children}
    </label>
);

// Card Components
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className}`} {...props}>
        {children}
    </div>
);
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
);
const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
        {children}
    </h3>
);
const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
        {children}
    </p>
);
const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
);

// Tabs Components
const Tabs: React.FC<React.HTMLAttributes<HTMLDivElement> & { defaultValue: string, value?: string, onValueChange?: (value: string) => void }> = ({ children, className = '', defaultValue, value, onValueChange, ...props }) => {
    const [currentTab, setCurrentTab] = useState(defaultValue);
    const controlledValue = value !== undefined ? value : currentTab;
    const setValue = onValueChange || setCurrentTab;

    const contextValue = { currentTab: controlledValue, setValue };

    return (
        <TabsContext.Provider value={contextValue}>
            <div className={className} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

interface TabsContextType {
    currentTab: string;
    setValue: (value: string) => void;
}
const TabsContext = createContext<TabsContextType | undefined>(undefined);
const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("Tabs components must be used within a Tabs component");
    return context;
};

const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
        {children}
    </div>
);

const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({ children, className = '', value, ...props }) => {
    const { currentTab, setValue } = useTabsContext();
    const isActive = currentTab === value;

    return (
        <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 
                ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            } ${className}`}
            onClick={() => setValue(value)}
            {...props}
        >
            {children}
        </button>
    );
};

const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ children, className = '', value, ...props }) => {
    const { currentTab } = useTabsContext();
    return currentTab === value ? <div className={`mt-2 ${className}`} {...props}>{children}</div> : null;
};

// Select Components (Simplified using native HTML select)
interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}
const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => (
    <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
        {children}
    </select>
);
const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;
const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const SelectItem: React.FC<{ value: string, children: React.ReactNode }> = ({ value, children }) => (
    <option value={value}>{children}</option>
);


// --- Data Models and Mock API ---

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'club_admin' | 'college_admin';
  clubs: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const mockUsers: Record<string, User> = {
  'student@college.edu': { id: 'u1', name: 'Student Sam', email: 'student@college.edu', role: 'student', clubs: [] },
  'clubadmin@college.edu': { id: 'u2', name: 'Club Cindy', email: 'clubadmin@college.edu', role: 'club_admin', clubs: ['Tech Club'] },
  'admin@college.edu': { id: 'u3', name: 'Admin Alex', email: 'admin@college.edu', role: 'college_admin', clubs: [] },
};

// --- 2. AuthContext and Provider ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Could not parse user from localStorage", e);
      return null;
    }
  });
  const [loading, setLoading] = useState(false); 

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- 3. LoginPage Component ---

function LoginPage() {
  const { login } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    clubs: []
  });
  const [loading, setLoading] = useState(false);

  // ------------------- LOGIN -------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = mockUsers[loginData.email];

      if (user && loginData.password === 'password') {
        login(user);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        throw new Error('Invalid credentials');
      }

    } catch (error: any) {
      console.error(error);
      toast.error('Invalid credentials. Try: student@college.edu, clubadmin@college.edu, or admin@college.edu with password "password"');
    }

    setLoading(false);
  };

  // ------------------- REGISTER -------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser: User = {
        id: crypto.randomUUID(), 
        name: registerData.name, 
        email: registerData.email, 
        role: registerData.role as 'student' | 'club_admin', 
        clubs: []
      };

      login(newUser); 
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-full shadow-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your campus events efficiently</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@college.edu"
                      value={loginData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      value={loginData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-700 font-semibold">Demo accounts (Password: <span className='font-bold text-indigo-600'>password</span>):</p>
                  <div className="grid gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Student: <span className='font-mono'>student@college.edu</span></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>Club Admin: <span className='font-mono'>clubadmin@college.edu</span></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>College Admin: <span className='font-mono'>admin@college.edu</span></span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="Jane Doe"
                      value={registerData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="jane@college.edu"
                      value={registerData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Enter your password"
                      value={registerData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={registerData.role} onValueChange={(value) => setRegisterData({ ...registerData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="club_admin">Club Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- 4. Header Component ---

function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Map path to title
    const getTitle = useCallback(() => {
        if (location.pathname.startsWith('/event/')) return 'Event Details';
        if (location.pathname === '/create-event') return 'Create New Event';
        
        switch (user?.role) {
            case 'student': return 'Student Dashboard';
            case 'club_admin': return 'Club Admin Dashboard';
            case 'college_admin': return 'College Admin Panel';
            default: return 'Campus Events';
        }
    }, [user, location.pathname]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {getTitle()}
                </h1>
                
                <div className="flex items-center space-x-4">
                    {user && (
                        <span className="text-sm text-gray-700 font-medium hidden sm:inline">
                            Welcome, <span className="font-bold">{user.name}</span> ({user.role.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})
                        </span>
                    )}
                    {user && (
                        <Button 
                            onClick={logout} 
                            variant="ghost" 
                            className="text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

// --- 5. Dashboard Components (Mock Content) ---

const events = [
    { id: 'e1', title: 'Code Jam 2024', date: '2024-11-15', club: 'Tech Club', attendees: 120, status: 'approved', description: 'Annual programming competition hosted by the Tech Club.' },
    { id: 'e2', title: 'Winter Gala', date: '2024-12-05', club: 'Social Committee', attendees: 450, status: 'approved', description: 'A formal evening event to celebrate the end of the semester.' },
    { id: 'e3', title: 'Book Reading Session', date: '2024-11-01', club: 'Literature Society', attendees: 30, status: 'pending', description: 'A quiet reading session focusing on classic American literature.' },
    { id: 'e4', title: 'Club Fundraiser', date: '2024-11-20', club: 'Tech Club', attendees: 75, status: 'approved', description: 'Selling baked goods to raise funds for new club equipment.' },
];

const EventCard: React.FC<{ event: typeof events[0], showActions?: boolean }> = ({ event, showActions = false }) => {
    const navigate = useNavigate();
    
    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
            <CardHeader>
                <CardTitle className="text-lg text-indigo-600">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" /> 
                    {new Date(event.date).toLocaleDateString()} by {event.club}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div className="text-sm flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    {event.attendees} Registered
                </div>
                {showActions ? (
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {event.status.toUpperCase()}
                    </div>
                ) : (
                    <Button variant="outline" size="sm">View Details</Button>
                )}
            </CardContent>
        </Card>
    );
};


function StudentDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Your Campus Life</h2>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 bg-indigo-50 border-indigo-200">
                    <CardTitle className="text-xl text-indigo-600 flex items-center gap-2"><Calendar className="w-5 h-5"/> Upcoming Events</CardTitle>
                    <p className="text-4xl font-bold mt-2">12</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                    <CardTitle className="text-xl text-green-600 flex items-center gap-2"><Users className="w-5 h-5"/> Clubs Joined</CardTitle>
                    <p className="text-4xl font-bold mt-2">3</p>
                </Card>
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <CardTitle className="text-xl text-yellow-600 flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Your Attendance</CardTitle>
                    <p className="text-4xl font-bold mt-2">85%</p>
                </Card>
            </section>
            
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">Events You Might Like</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.filter(e => e.status === 'approved').map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function ClubAdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const clubEvents = events.filter(e => user?.clubs.includes(e.club));

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Club Management Console</h2>
            
            <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">Your Events ({user?.clubs.join(', ') || 'No Club'})</h3>
                <Button onClick={() => navigate('/create-event')} className='bg-indigo-600 hover:bg-indigo-700'>
                    <Calendar className="w-4 h-4 mr-2" />
                    Propose New Event
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubEvents.length > 0 ? (
                    clubEvents.map(event => (
                        <EventCard key={event.id} event={event} showActions={true} />
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">No events submitted by your club yet.</p>
                )}
            </div>
        </div>
    );
}

function CollegeAdminDashboard() {
    const pendingEvents = events.filter(e => e.status === 'pending');
    const approvedEvents = events.filter(e => e.status === 'approved');

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-900">College Administration Panel</h2>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <CardTitle className="text-xl text-yellow-600 flex items-center gap-2"><Clock className="w-5 h-5"/> Pending Approvals</CardTitle>
                    <p className="text-4xl font-bold mt-2">{pendingEvents.length}</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                    <CardTitle className="text-xl text-green-600 flex items-center gap-2"><Settings className="w-5 h-5"/> Active Events</CardTitle>
                    <p className="text-4xl font-bold mt-2">{approvedEvents.length}</p>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">Event Approval Queue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingEvents.length > 0 ? (
                        pendingEvents.map(event => (
                            <Card key={event.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm border-l-4 border-yellow-500">
                                <div>
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-gray-500">{event.club} on {new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <div className="space-x-2 mt-3 sm:mt-0">
                                    <Button size="sm" className='bg-green-600 hover:bg-green-700'>Approve</Button>
                                    <Button size="sm" variant="outline" className='text-red-600 border-red-300'>Reject</Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full">All events are currently approved.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

function EventDetails() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Mock event ID extraction
    const eventId = location.pathname.split('/').pop();
    const event = events.find(e => e.id === eventId);

    // Helper to determine the correct redirection path
    const getSafeRolePath = (role: string | undefined): string => {
        const safeRole = role || 'student';
        return `/${safeRole.replace('_', '-')}`;
    };

    if (!event) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Event Not Found</h2>
                <Button onClick={() => navigate(getSafeRolePath(user?.role))} className="mt-4">Go to Dashboard</Button>
            </div>
        );
    }
    
    return (
        <Card className="p-6 max-w-3xl mx-auto shadow-xl">
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-3xl font-extrabold text-indigo-700">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Organized by: <span className="font-semibold text-gray-700">{event.club}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium">Date:</span>
                        <span className="text-lg font-bold">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium">Time:</span>
                        <span className="text-lg font-bold">1:00 PM - 3:00 PM</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-800">Description</h4>
                    <p className="text-gray-600">
                        {event.description} This event is open to all students and will feature a special guest speaker, complimentary refreshments, and a chance to network with peers. We look forward to seeing you there!
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-800">Attendance</h4>
                    <p className="text-gray-600 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold text-indigo-600">{event.attendees}</span> students have registered so far.
                    </p>
                </div>
            </CardContent>
            
            {user?.role === 'student' && (
                <div className="pt-4 border-t flex justify-end">
                    <Button className='bg-indigo-600 hover:bg-indigo-700'>Register for Event</Button>
                </div>
            )}
        </Card>
    );
}

function CreateEvent() {
    const { user } = useAuth();
    
    return (
        <Card className="max-w-xl mx-auto p-6 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-700">Submit Event Proposal</CardTitle>
                <CardDescription>
                    Fill out the details below to propose an event for approval by the college administration.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" placeholder="Annual Hackathon" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="club">Organizing Club</Label>
                    <Input id="club" disabled value={user?.clubs[0] || 'Unknown Club (Check Club Admin Login)'} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Campus Auditorium" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description" 
                        rows={4} 
                        placeholder="Provide a detailed description of the event..."
                    ></Textarea>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">Submit for Approval</Button>
            </CardContent>
        </Card>
    );
}

// --- 6. Routing Logic (AppRoutes) ---

/**
 * Safely determines the navigation path for a logged-in user.
 */
const getSafeRolePath = (role: string | undefined): string => {
  const safeRole = role || 'student';
  return `/${safeRole.replace('_', '-')}`;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const userRolePath = useMemo(() => {
    return getSafeRolePath(user?.role);
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
             <p className='mt-4 text-gray-600'>Loading application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }
  
  const CLUB_ADMIN = 'club_admin';
  const COLLEGE_ADMIN = 'college_admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Student Dashboard */}
          <Route path="/student" element={user.role === 'student' ? <StudentDashboard /> : <Navigate to={userRolePath} />} />
          
          {/* Club Admin Dashboard */}
          <Route path="/club-admin" element={user.role === CLUB_ADMIN ? <ClubAdminDashboard /> : <Navigate to={userRolePath} />} />
          
          {/* College Admin Dashboard */}
          <Route path="/college-admin" element={user.role === COLLEGE_ADMIN ? <CollegeAdminDashboard /> : <Navigate to={userRolePath} />} />
          
          {/* Event Details (Accessible by all logged-in users) */}
          <Route path="/event/:id" element={<EventDetails />} />
          
          {/* Create Event (Restricted to Club Admins) */}
          <Route path="/create-event" element={user.role === CLUB_ADMIN ? <CreateEvent /> : <Navigate to={userRolePath} />} />
          
          {/* Default Route: Redirects to the user's correct dashboard path */}
          <Route path="/" element={<Navigate to={userRolePath} replace />} />
          
          {/* Fallback for unknown URLs */}
          <Route path="*" element={<Navigate to={userRolePath} replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

// --- 7. Main App Component and Context for useNavigate ---

// Context to bridge navigate function since the hook is defined inside App.tsx
const RouterContext = createContext<{ navigate: (to: string) => void } | undefined>(undefined);

// Custom hook to provide useNavigate equivalent functionality in AppRoutes since it's outside Router 
const useNavigate = () => {
    const context = useContext(RouterContext);
    if (!context) {
        // This log should theoretically not be reached if AppRoutes is mounted correctly
        console.error("useNavigate called outside RouterContext");
        return (to: string) => console.error("Navigation failed for:", to);
    }
    return context.navigate;
};

export default function App() {
  const [navigateFunc, setNavigateFunc] = useState(() => (to: string) => console.error("Navigate function not set"));
  
  // Custom component used to hook into react-router-dom's useNavigate inside the Router
  const NavigationHook: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = (useLocation() as any).navigate || ((to: string) => console.error("Router navigate unavailable"));
    
    // Set the navigate function to the state once it's available
    useEffect(() => {
        if (navigate && typeof navigate === 'function') {
            setNavigateFunc(() => navigate);
        }
    }, [navigate]);

    return <>{children}</>;
  }


  return (
    <Router>
        <NavigationHook />
        <RouterContext.Provider value={{ navigate: navigateFunc }}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </RouterContext.Provider>
    </Router>
  );
}
