import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RentalPropertyAnalyzer from './RentalPropertyAnalyzer';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ShareViewGate from './components/shared/ShareViewGate';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ShareViewGate>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <RentalPropertyAnalyzer />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </ShareViewGate>
  );
}

export default App;
