import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import Clearance from './pages/Clearance'; // Added the second warning step
import SOP from './pages/SOP';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PaperDetail from './pages/PaperDetail';


function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/gateway" element={<Clearance />} /> {/* Step 2 */}
        <Route path="/login" element={<Login />} />


        {/* Protected Routes - Only accessible if logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sop" element={<SOP/>}/>
          <Route path="/paper/:id" element={<PaperDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
