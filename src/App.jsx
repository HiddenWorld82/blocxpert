import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RentalPropertyAnalyzer from './RentalPropertyAnalyzer';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NetworkStatusBadge from './components/NetworkStatusBadge';

function App() {
  return (
    <Router>
      <NetworkStatusBadge />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RentalPropertyAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
