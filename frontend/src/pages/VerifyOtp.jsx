import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const e = sessionStorage.getItem('pendingEmail');
    if (!e) nav('/login');
    else setEmail(e);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post('/auth/verify-otp', { email, otp });
      login(r.data.token, r.data.user);
      toast.success('Login successful');
      sessionStorage.removeItem('pendingEmail');
      if (r.data.user.faceStatus !== 'approved') {
        nav('/face/register');
      } else if (r.data.user.role === 'admin') {
        nav('/admin');
      } else {
        nav('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`Code sent to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input text-center text-2xl tracking-widest"
          placeholder="------"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
        />
        <button disabled={loading || otp.length !== 6} className="btn-primary w-full">
          {loading ? 'Verifying...' : 'Verify & Login'}
        </button>
      </form>
    </AuthLayout>
  );
}