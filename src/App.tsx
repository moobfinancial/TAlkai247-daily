import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth/AuthContext.tsx';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/PrivateRoute';
import Sidebar from '@/components/Sidebar';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Assistants from '@/pages/Assistants';
import PhoneNumber from '@/pages/PhoneNumber';
import CallLogs from '@/pages/CallLogs';
import SMS from '@/pages/SMS';
import VoiceLibrary from '@/pages/VoiceLibrary';
import ContactList from '@/pages/ContactList';
import Campaigns from '@/pages/Campaigns';
import GoalTemplate from '@/pages/GoalTemplate';
import TransparencyLevels from '@/pages/TransparencyLevels';
import Whisper from '@/pages/Whisper';
import Billing from '@/pages/Billing';
import Account from '@/pages/Account';
import Resources from '@/pages/Resources';
import Help from '@/pages/Help';
import Logout from '@/pages/Logout';
import LiveKitTest from '@/pages/LiveKitTest';
import LiveKitRoom from '@/pages/LiveKitRoom';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/dashboard/assistants" element={<ProtectedLayout><Assistants /></ProtectedLayout>} />
          <Route path="/dashboard/phone" element={<ProtectedLayout><PhoneNumber /></ProtectedLayout>} />
          <Route path="/dashboard/logs" element={<ProtectedLayout><CallLogs /></ProtectedLayout>} />
          <Route path="/dashboard/sms" element={<ProtectedLayout><SMS /></ProtectedLayout>} />
          <Route path="/dashboard/voice" element={<ProtectedLayout><VoiceLibrary /></ProtectedLayout>} />
          <Route path="/dashboard/contacts" element={<ProtectedLayout><ContactList /></ProtectedLayout>} />
          <Route path="/dashboard/campaigns" element={<ProtectedLayout><Campaigns /></ProtectedLayout>} />
          <Route path="/dashboard/goal-template" element={<ProtectedLayout><GoalTemplate /></ProtectedLayout>} />
          <Route path="/dashboard/transparency" element={<ProtectedLayout><TransparencyLevels /></ProtectedLayout>} />
          <Route path="/dashboard/whisper" element={<ProtectedLayout><Whisper /></ProtectedLayout>} />
          <Route path="/dashboard/billing" element={<ProtectedLayout><Billing /></ProtectedLayout>} />
          <Route path="/dashboard/account" element={<ProtectedLayout><Account /></ProtectedLayout>} />
          <Route path="/dashboard/resources" element={<ProtectedLayout><Resources /></ProtectedLayout>} />
          <Route path="/dashboard/help" element={<ProtectedLayout><Help /></ProtectedLayout>} />
          <Route path="/dashboard/logout" element={<ProtectedLayout><Logout /></ProtectedLayout>} />

          {/* LiveKit routes */}
          <Route path="/livekit-test" element={<ProtectedLayout><LiveKitTest /></ProtectedLayout>} />
          <Route path="/livekit-room/:roomName" element={<ProtectedLayout><LiveKitRoom /></ProtectedLayout>} />

          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}