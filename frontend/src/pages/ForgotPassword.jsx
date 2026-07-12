import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import AuthLayout from '../layouts/AuthLayout';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      toast.success('Password reset. Please login.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you an OTP">
      {step === 1 ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <input className="input" placeholder="OTP" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} />
          <input className="input" type="password" placeholder="New Password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      )}
      <div className="text-center text-sm mt-4">
        <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
      </div>
    </AuthLayout>
  );
}