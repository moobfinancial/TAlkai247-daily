import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  FileText, 
  MessageSquare, 
  Mic2, 
  UserRound, 
  Megaphone, 
  Target, 
  Eye, 
  CreditCard, 
  User, 
  BookOpen, 
  HelpCircle, 
  LogOut,
  MessageCircle,
  Bot,
  Video
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname.split('/')[1] || '';

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'dashboard/assistants', icon: Users, label: 'Assistants' },
    { id: 'dashboard/phone', icon: Phone, label: 'Phone Number' },
    { id: 'dashboard/logs', icon: FileText, label: 'Call Logs' },
    { id: 'dashboard/sms', icon: MessageSquare, label: 'SMS' },
    { id: 'dashboard/voice', icon: Mic2, label: 'Voice Library' },
    { id: 'dashboard/contacts', icon: UserRound, label: 'Contact List' },
    { id: 'dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
    { id: 'dashboard/goal-template', icon: Target, label: 'Goal Template' },
    { id: 'dashboard/transparency', icon: Eye, label: 'Transparency Levels' },
    { id: 'dashboard/whisper', icon: MessageCircle, label: 'Whisper' },
    { id: 'livekit-test', icon: Video, label: 'LiveKit Test' },
    { id: 'dashboard/billing', icon: CreditCard, label: 'Billing' },
    { id: 'dashboard/account', icon: User, label: 'Account' },
    { id: 'dashboard/resources', icon: BookOpen, label: 'Resources' },
    { id: 'dashboard/help', icon: HelpCircle, label: 'Help' },
    { id: 'dashboard/logout', icon: LogOut, label: 'Logout' }
  ];

  const handleNavigation = (path: string) => {
    if (path === 'dashboard/logout') {
      logout();
    } else {
      navigate(`/${path}`);
    }
  };

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col min-h-screen">
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-teal-400">Talkai247</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`w-full flex items-center p-2 rounded transition-colors ${
              location.pathname.includes(item.id)
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}