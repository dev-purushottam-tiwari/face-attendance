import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiCalendar, FiClock, FiFileText, FiBell,
  FiSettings, FiLogOut, FiMenu, FiSun, FiMoon, FiUsers, FiCheckSquare, FiImage, FiBarChart2,
} from 'react-icons/fi';
import api from '../api/client';
import toast from 'react-hot-toast';

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/attendance', label: 'Attendance', icon: FiClock },
  { to: '/history', label: 'History', icon: FiCalendar },
  { to: '/leaves', label: 'Leaves', icon: FiFileText, counterKey: 'pendingLeaves' },
  { to: '/notifications', label: 'Notifications', icon: FiBell, counterKey: 'unreadNotifications' },
  { to: '/profile', label: 'Profile', icon: FiSettings },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/admin/employees', label: 'Employees', icon: FiUsers, counterKey: 'pendingRegistrations' },
  { to: '/admin/approvals', label: 'Approvals', icon: FiCheckSquare, counterKey: 'pendingRegistrations' },
  { to: '/admin/faces', label: 'Face Requests', icon: FiImage, counterKey: 'pendingFaces' },
  { to: '/admin/attendance', label: 'Attendance', icon: FiClock },
  { to: '/admin/leaves', label: 'Leaves', icon: FiFileText, counterKey: 'pendingLeaves' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counters, setCounters] = useState({
    unreadNotifications: 0,
    pendingLeaves: 0,
    pendingRegistrations: 0,
    pendingFaces: 0,
  });
  const nav = useNavigate();
  const location = useLocation();

  // ✅ Fetch all counters
  const fetchCounters = useCallback(async () => {
    try {
      const newCounters = { ...counters };

      // Always fetch unread notifications
      const notifRes = await api.get('/notifications');
      newCounters.unreadNotifications = notifRes.data.unread || 0;

      if (user?.role === 'admin') {
        const statsRes = await api.get('/admin/stats');
        const stats = statsRes.data.stats;
        newCounters.pendingRegistrations = stats.pendingRegistrations || 0;
        newCounters.pendingFaces = stats.pendingFaces || 0;
        newCounters.pendingLeaves = stats.pendingLeaves || 0;
      } else {
        const leavesRes = await api.get('/leaves/my');
        newCounters.pendingLeaves = leavesRes.data.leaves?.filter(l => l.status === 'pending').length || 0;
      }

      setCounters(newCounters);
    } catch (err) {
      console.error('Failed to fetch counters:', err);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchCounters();
    // Refresh every 15 seconds for real-time feel
    const interval = setInterval(fetchCounters, 15000);
    return () => clearInterval(interval);
  }, [fetchCounters]);

  // ✅ Re-fetch counters when navigating (e.g., after marking as read)
  useEffect(() => {
    fetchCounters();
  }, [location.pathname]);

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    nav('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform`}
      >
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">🎯</div>
          <span className="font-bold text-lg">FaceAttend</span>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((l) => {
            const count = l.counterKey ? counters[l.counterKey] : 0;
            
            return (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <l.icon />
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                  {l.label}
                </div>
                {count > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={handleLogout} className="btn-secondary w-full justify-start gap-3">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <div className="hidden lg:block text-sm text-slate-500">
            Welcome, <span className="font-medium text-slate-800 dark:text-white">{user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}