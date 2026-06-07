import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import ProjectDetail from './pages/ProjectDetail';
import Publish from './pages/Publish';
import Profile from './pages/Profile';
import Mentors from './pages/Mentors';
import MentorDashboard from './pages/MentorDashboard';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/mentors" element={<Mentors />} />

        {/* Protected routes */}
        <Route path="/publish" element={<PrivateRoute><Publish /></PrivateRoute>} />
        <Route path="/mentor/dashboard" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
        <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🎭</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--gold)' }}>404</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Página no encontrada</p>
            <a href="/" style={{ marginTop: 24, color: 'var(--gold)', fontSize: 16 }}>← Volver al inicio</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
