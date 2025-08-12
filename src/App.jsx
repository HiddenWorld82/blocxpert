import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NetworkStatusBadge from './components/NetworkStatusBadge';
import HomeScreen from './components/HomeScreen';
import BuildingDashboard from './components/BuildingDashboard';
import ScenarioEditor from './components/ScenarioEditor';
import ScenarioComparison from './components/ScenarioComparison';
import { useAuth } from './contexts/AuthContext';
import defaultProperty from './defaults/defaultProperty';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import useScenarios from './hooks/useScenarios';

const BuildingsPage = () => {
  const { buildings, buildingsLoading } = useAuth();
  const navigate = useNavigate();
  if (buildingsLoading) return <div>Chargement...</div>;
  return (
    <HomeScreen
      buildings={buildings}
      onNew={() => navigate('/buildings/new/scenarios/new')}
      onNewScenario={(b) => navigate(`/buildings/${b.id}/scenarios/new`)}
    />
  );
};

const ScenarioEditorPage = () => {
  const [currentScenario, setCurrentScenario] = useState(defaultProperty);
  const [lockedFields, setLockedFields] = useState({
    debtCoverage: true,
    welcomeTax: true,
  });
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const analysis = useRentabilityCalculator(
    currentScenario,
    advancedExpenses,
    lockedFields,
    setCurrentScenario,
  );
  return (
    <ScenarioEditor
      currentScenario={currentScenario}
      setCurrentScenario={setCurrentScenario}
      lockedFields={lockedFields}
      setLockedFields={setLockedFields}
      analysis={analysis}
      advancedExpenses={advancedExpenses}
      setAdvancedExpenses={setAdvancedExpenses}
    />
  );
};

const ScenarioComparisonPage = () => {
  const { buildingId } = useParams();
  const { scenarios } = useScenarios(buildingId);
  return <ScenarioComparison scenarios={scenarios} onClose={() => {}} />;
};

function App() {
  return (
    <Router>
      <NetworkStatusBadge />
      <Routes>
        <Route path="/" element={<Navigate to="/buildings" replace />} />
        <Route
          path="/buildings"
          element={
            <ProtectedRoute>
              <BuildingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buildings/:buildingId"
          element={
            <ProtectedRoute>
              <BuildingDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buildings/:buildingId/scenarios/new"
          element={
            <ProtectedRoute>
              <ScenarioEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buildings/:buildingId/scenarios/:scenarioId"
          element={
            <ProtectedRoute>
              <ScenarioEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buildings/:buildingId/compare"
          element={
            <ProtectedRoute>
              <ScenarioComparisonPage />
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
