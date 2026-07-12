import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiPercent } from 'react-icons/fi';
import FaceCamera from '../../components/FaceCamera';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user, refreshUser } = useAuth();
  const nav = useNavigate();
  const [today, setToday] = useState(null);
  const [stats, setStats] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      await refreshUser();
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser?.isApproved) {
        toast.error('Your account is pending admin approval');
        nav('/login');
        return;
      }
      
      if (currentUser?.faceStatus === 'none' || currentUser?.faceStatus === 'rejected') {
        nav('/face/register');
        return;
      }
      
      if (currentUser?.faceStatus === 'pending') {
        toast('Your face registration is pending admin approval', {
          icon: 'ℹ️',
          duration: 4000,
        });
        setLoading(false);
        return;
      }
      
      if (currentUser?.faceStatus === 'approved') {
        try {
          const [t, s] = await Promise.all([
            api.get('/attendance/today'),
            api.get('/attendance/stats'),
          ]);
          setToday(t.data.attendance);
          setStats(s.data.stats);
        } catch (err) {
          console.error('Failed to load attendance:', err);
        }
      }
      
      setLoading(false);
    };
    
    checkStatus();
  }, []);

  const handleCheckIn = async (descriptor) => {
    try {
      console.log('📤 Sending descriptor for check-in...');
      
      const r = await api.post('/attendance/checkin', { descriptor });
      
      toast.success(`✓ ${r.data.message}`, {
        duration: 5000,
        icon: '🎉',
      });
      
      if (r.data.matchConfidence) {
        console.log(`✓ Face match confidence: ${r.data.matchConfidence}`);
      }
      
      setToday(r.data.attendance);
      setShowCheckIn(false);
    } catch (err) {
      console.error('Check-in error:', err);
      const message = err.response?.data?.message || 'Check-in failed';
      
      // Show detailed error
      if (err.response?.data?.confidence) {
        toast.error(`${message} (Confidence: ${err.response.data.confidence.toFixed(1)}%)`, {
          duration: 6000,
        });
      } else {
        toast.error(message, { duration: 6000 });
      }
      
      setShowCheckIn(false);
    }
  };

  const handleCheckOut = async (descriptor) => {
    try {
      console.log('📤 Sending descriptor for check-out...');
      
      const r = await api.post('/attendance/checkout', { descriptor });
      
      toast.success(`✓ ${r.data.message}`, {
        duration: 5000,
        icon: '👋',
      });
      
      if (r.data.workingTime) {
        console.log(`✓ Working time: ${r.data.workingTime}`);
      }
      
      setToday(r.data.attendance);
      setShowCheckOut(false);
    } catch (err) {
      console.error('Check-out error:', err);
      const message = err.response?.data?.message || 'Check-out failed';
      
      if (err.response?.data?.confidence) {
        toast.error(`${message} (Confidence: ${err.response.data.confidence.toFixed(1)}%)`, {
          duration: 6000,
        });
      } else {
        toast.error(message, { duration: 6000 });
      }
      
      setShowCheckOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Format time with seconds
  const formatTime = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };
  
  // Format working hours with seconds
  const formatWorkingHours = (attendance) => {
    if (!attendance?.workingSeconds && attendance?.workingSeconds !== 0) return '—';
    
    const seconds = attendance.workingSeconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-slate-500">{user?.designation} • {user?.department}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present" value={stats?.present || 0} icon={FiCheckCircle} color="green" />
        <StatCard title="Late" value={stats?.late || 0} icon={FiAlertCircle} color="yellow" />
        <StatCard title="Absent" value={stats?.absent || 0} icon={FiXCircle} color="red" />
        <StatCard title="Attendance %" value={`${stats?.percentage || 0}%`} icon={FiPercent} color="primary" />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">Check In</p>
            <p className="text-xl font-semibold">{formatTime(today?.checkIn)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Check Out</p>
            <p className="text-xl font-semibold">{formatTime(today?.checkOut)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Working Hours</p>
            <p className="text-xl font-semibold">{formatWorkingHours(today)}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {!today?.checkIn ? (
            <button onClick={() => setShowCheckIn(true)} className="btn-primary">
              <FiClock className="mr-2" /> Check In
            </button>
          ) : !today?.checkOut ? (
            <button onClick={() => setShowCheckOut(true)} className="btn-primary">
              <FiClock className="mr-2" /> Check Out
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <FiCheckCircle /> Day completed
            </div>
          )}
        </div>
      </div>

      <Modal open={showCheckIn} onClose={() => setShowCheckIn(false)} title="" size="lg">
        <FaceCamera 
          mode="verify" 
          onVerify={handleCheckIn} 
          onClose={() => setShowCheckIn(false)}
          requireLiveness 
        />
      </Modal>

      <Modal open={showCheckOut} onClose={() => setShowCheckOut(false)} title="" size="lg">
        <FaceCamera 
          mode="verify" 
          onVerify={handleCheckOut} 
          onClose={() => setShowCheckOut(false)}
          requireLiveness 
        />
      </Modal>
    </div>
  );
}