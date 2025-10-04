import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import ClubAdminDashboard from './components/ClubAdminDashboard';
import CollegeAdminDashboard from './components/CollegeAdminDashboard';
import EventDetails from './components/EventDetails';
import CreateEvent from './components/CreateEvent';
import Header from './components/Header';
import { Toaster } from './components/ui/sonner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/student" element={user.role === 'student' ? <StudentDashboard /> : <Navigate to={`/${user.role}`} />} />
          <Route path="/club-admin" element={user.role === 'club_admin' ? <ClubAdminDashboard /> : <Navigate to={`/${user.role}`} />} />
          <Route path="/college-admin" element={user.role === 'college_admin' ? <CollegeAdminDashboard /> : <Navigate to={`/${user.role.replace('_', '-')}`} />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/create-event" element={user.role === 'club_admin' ? <CreateEvent /> : <Navigate to={`/${user.role.replace('_', '-')}`} />} />
          <Route path="/" element={<Navigate to={`/${user.role.replace('_', '-')}`} />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}