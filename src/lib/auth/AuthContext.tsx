import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const checkSession = () => {
      // For development, always set a mock user
      const mockUser = {
        id: '1',
        email: 'dev@example.com',
        name: 'Developer',
        role: 'user'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'Bearer mock-token');
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Mock login - always succeed in development
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: 'user'
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'Bearer mock-token');
      setUser(mockUser);

      toast({
        title: "Success",
        description: "Welcome back!"
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signup = async (data: { email: string; password: string; name: string }) => {
    try {
      // Mock signup - always succeed in development
      const mockUser = {
        id: '1',
        email: data.email,
        name: data.name,
        role: 'user'
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'Bearer mock-token');
      setUser(mockUser);

      toast({
        title: "Success",
        description: "Account created successfully!"
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('livekitToken');
    setUser(null);
    navigate('/login');
    toast({
      title: "Success",
      description: "You have been logged out"
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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