import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import VoiceAssistant from './pages/VoiceAssistant';
import CommunityLearning from './pages/CommunityLearning';
import GovernmentSchemes from './pages/GovernmentSchemes';
import SavingsGoals from './pages/SavingsGoals';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignupWithAssessment from './pages/SignupWithAssessment';
import FinancialLessons from './pages/FinancialLessons';
import FinancialSimulations from './pages/FinancialSimulations';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Skip onboarding for existing users who are logging in
  // Only show onboarding for new registrations
  const needsOnboarding = false;

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignupWithAssessment />} />
          
          {/* Protected routes */}
          {isAuthenticated ? (
            <>
              {needsOnboarding ? (
                <Route path="*" element={<Onboarding />} />
              ) : (
                <Route path="/app" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="voice" element={<VoiceAssistant />} />
                  <Route path="community" element={<CommunityLearning />} />
                  <Route path="schemes" element={<GovernmentSchemes />} />
                  <Route path="savings" element={<SavingsGoals />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="lessons" element={<FinancialLessons />} />
                  <Route path="simulations" element={<FinancialSimulations />} />
                </Route>
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

export default App;
