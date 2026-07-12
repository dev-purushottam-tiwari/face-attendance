import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import FaceRegister from './pages/FaceRegister';
import DashboardLayout from './layouts/DashboardLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import History from './pages/employee/History';
import Leaves from './pages/employee/Leaves';
import Notifications from './pages/employee/Notifications';
import Profile from './pages/employee/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import FaceApprovals from './pages/admin/FaceApprovals';
import AttendanceReport from './pages/admin/AttendanceReport';
import LeavesReview from './pages/admin/LeavesReview';

const Protected = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<Protected><DashboardLayout /></Protected>}>
        <Route path="/face/register" element={<FaceRegister />} />

        {/* Employee */}
        <Route path="/dashboard" element={<Protected><EmployeeDashboard /></Protected>} />
        <Route path="/attendance" element={<Protected><EmployeeDashboard /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
        <Route path="/leaves" element={<Protected><Leaves /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        {/* Admin */}
        <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
        <Route path="/admin/employees" element={<Protected role="admin"><Employees /></Protected>} />
        <Route path="/admin/approvals" element={<Protected role="admin"><Employees /></Protected>} />
        <Route path="/admin/faces" element={<Protected role="admin"><FaceApprovals /></Protected>} />
        <Route path="/admin/attendance" element={<Protected role="admin"><AttendanceReport /></Protected>} />
        <Route path="/admin/leaves" element={<Protected role="admin"><LeavesReview /></Protected>} />
      </Route>

      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}