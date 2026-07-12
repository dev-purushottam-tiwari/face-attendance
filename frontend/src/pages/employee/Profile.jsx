import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', department: user?.department || '', designation: user?.designation || '',
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', pwd);
      toast.success('Password changed');
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Basic Info</h2>
        <form onSubmit={updateProfile} className="space-y-3">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
          <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
          <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Designation" />
          <p className="text-sm text-slate-500">Email: {user?.email} • ID: {user?.employeeId}</p>
          <button className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={changePwd} className="space-y-3">
          <input type="password" className="input" placeholder="Current Password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
          <input type="password" className="input" placeholder="New Password (min 6)" minLength={6} value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
          <button className="btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  );
}