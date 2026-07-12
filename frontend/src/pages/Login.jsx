import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';
import { validators } from '../utils/validation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validators[name]?.(value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const emailError = validators.email(form.email);
    const passwordError = form.password ? '' : 'Password is required';
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      setTouched({ email: true, password: true });
      return;
    }
    
    setLoading(true);
    try {
      const r = await api.post('/auth/login', form);
      
      // Direct login (admin or returning employee)
      if (r.data.directLogin) {
        login(r.data.token, r.data.user);
        toast.success('Login successful');
        
        if (r.data.user.faceStatus !== 'approved' && r.data.user.role !== 'admin') {
          nav('/face/register');
        } else if (r.data.user.role === 'admin') {
          nav('/admin');
        } else {
          nav('/dashboard');
        }
        return;
      }
      
      // OTP required
      toast.success(r.data.message);
      sessionStorage.setItem('pendingEmail', form.email);
      nav('/verify-otp');
      
    } catch (err) {
  const message = err.response?.data?.message || 'Login failed';
  
  // Show specific email validation errors
  if (err.response?.data?.emailValid === false) {
    toast.error(`Email Error: ${message}`, { duration: 6000 });
    setErrors({ email: message });
  } else if (message.toLowerCase().includes('email') || message.toLowerCase().includes('credentials')) {
    toast.error(message);
    setErrors({ email: 'Invalid email or password' });
  } else {
    toast.error(message);
  }
}finally {
      setLoading(false);
    }
  };

  const isFormValid = form.email && form.password && !errors.email && !errors.password;

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          success={touched.email && !errors.email && form.email}
          placeholder="you@company.com"
          required
          autoComplete="email"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          success={touched.password && !errors.password && form.password}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        <div className="flex justify-between items-center text-sm">
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="text-primary-600 hover:underline">
            Create account
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={loading || !isFormValid}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  );
}