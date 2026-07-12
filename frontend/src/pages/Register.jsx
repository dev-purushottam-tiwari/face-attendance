import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { validators, IT_DEPARTMENTS, IT_DESIGNATIONS } from '../utils/validation';

export default function Register() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingId, setCheckingId] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [idAvailable, setIdAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Auto-format employee ID to uppercase
  useEffect(() => {
    if (form.employeeId && form.employeeId !== form.employeeId.toUpperCase()) {
      setForm({ ...form, employeeId: form.employeeId.toUpperCase() });
    }
  }, [form.employeeId]);

  // Real-time employee ID availability check
  useEffect(() => {
    const checkId = async () => {
      const id = form.employeeId.toUpperCase();
      const formatError = validators.employeeId(id);
      
      if (formatError || id.length < 6) {
        setIdAvailable(null);
        return;
      }
      
      setCheckingId(true);
      try {
        const res = await api.get(`/check/employee-id/${id}`);
        setIdAvailable(res.data.available);
        if (!res.data.available && res.data.valid) {
          setErrors(prev => ({ ...prev, employeeId: res.data.message }));
        }
      } catch (err) {
        console.error('Check failed:', err);
      } finally {
        setCheckingId(false);
      }
    };
    
    const timeout = setTimeout(checkId, 500);
    return () => clearTimeout(timeout);
  }, [form.employeeId]);

  // Real-time email availability check
  useEffect(() => {
    const checkEmail = async () => {
      const email = form.email.toLowerCase();
      const formatError = validators.email(email);
      
      if (formatError) {
        setEmailAvailable(null);
        return;
      }
      
      setCheckingEmail(true);
      try {
        const res = await api.get(`/check/email/${email}`);
        setEmailAvailable(res.data.available);
        if (!res.data.available && res.data.valid) {
          setErrors(prev => ({ ...prev, email: res.data.message }));
        }
      } catch (err) {
        console.error('Check failed:', err);
      } finally {
        setCheckingEmail(false);
      }
    };
    
    const timeout = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeout);
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate on blur
    const error = validators[name]?.(value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validators[key]?.(form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    if (idAvailable === false) {
      toast.error('Employee ID is already taken');
      return;
    }
    
    if (emailAvailable === false) {
      toast.error('Email is already registered');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration submitted! Awaiting admin approval.');
      nav('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    form.name && form.employeeId && form.email && 
    form.password && form.department && form.designation &&
    Object.values(errors).every(e => !e) &&
    idAvailable !== false && emailAvailable !== false;

  return (
    <AuthLayout title="Create Account" subtitle="Join our IT team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name && errors.name}
          success={touched.name && !errors.name && form.name}
          placeholder="e.g., John Doe"
          required
          maxLength={100}
          autoComplete="name"
          helpText="Letters, spaces, dots, and hyphens only"
        />

        <FormField
          label="Employee ID"
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.employeeId && (errors.employeeId || (idAvailable === false ? 'Already taken' : ''))}
          success={touched.employeeId && !errors.employeeId && idAvailable === true}
          loading={checkingId}
          placeholder="e.g., EMP001"
          required
          maxLength={20}
          helpText="Format: EMP followed by 3+ digits (e.g., EMP001)"
        />

        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && (errors.email || (emailAvailable === false ? 'Already registered' : ''))}
          success={touched.email && !errors.email && emailAvailable === true}
          loading={checkingEmail}
          placeholder="you@company.com"
          required
          autoComplete="email"
        />

        <div className="space-y-1">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
            success={touched.password && !errors.password && form.password}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <FormField
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.department && errors.department}
          success={touched.department && !errors.department && form.department}
          required
        >
          <option value="">Select Department</option>
          {IT_DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </FormField>

        <FormField
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.designation && errors.designation}
          success={touched.designation && !errors.designation && form.designation}
          required
        >
          <option value="">Select Designation</option>
          {IT_DESIGNATIONS.map(des => (
            <option key={des} value={des}>{des}</option>
          ))}
        </FormField>

        <div className="flex justify-between items-center text-sm pt-2">
          <Link to="/login" className="text-primary-600 hover:underline">
            Already have an account?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={loading || !isFormValid} 
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}