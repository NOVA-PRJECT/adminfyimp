import { Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import Clearance from './pages/Clearance'; // Added the second warning step
import SOP from './pages/SOP';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PaperDetail from './pages/PaperDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SystemAudit from './pages/SystemAudit';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/gateway" element={<Clearance />} /> {/* Step 2 */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} /> 


        {/* Protected Routes - Only accessible if logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sop" element={<SOP/>}/>
          <Route path="/paper/:id" element={<PaperDetail />} />
          <Route path="/audit" element={<SystemAudit />} />
        </Route>
      </Routes>
      <SpeedInsights />
      <Analytics />
    </AuthProvider>
  );
}

export default App;
