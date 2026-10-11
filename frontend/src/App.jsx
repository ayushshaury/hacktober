import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Clubs } from './pages/Clubs';
import { ClubDetail } from './pages/ClubDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { Recommendations } from './pages/Recommendations';
import { ApplyInduction } from './pages/ApplyInduction';
import { MyApplications } from './pages/MyApplications';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid #818cf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Loading BIT Sindri Clubs Platform...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:slug" element={<ClubDetail />} />
          <Route path="/clubs/:slug/apply" element={<ApplyInduction />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route 
            path="/my-applications" 
            element={
              <ProtectedRoute allowedRoles={['club_admin']}>
                <MyApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['club_admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['club_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
