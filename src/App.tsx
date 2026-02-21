import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { WorkOrders } from './pages/WorkOrders';
import { WorkOrderDetail } from './pages/WorkOrderDetail';
import { Clients } from './pages/Clients';
import { Inventory } from './pages/Inventory';
import { Services } from './pages/Services';
import { Commissions } from './pages/Commissions';
import { Finances } from './pages/Finances';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

import { LandingPage } from './pages/LandingPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Privadas del SaaS */}
        <Route path="/app" element={
          <ErrorBoundary>
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          </ErrorBoundary>
        }>
          <Route index element={<Dashboard />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/:id" element={<WorkOrderDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="services" element={<Services />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="finances" element={<Finances />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
