import { useEffect, useState } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import { FiUsers, FiCheckCircle, FiClock, FiXCircle, FiUserCheck, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data.stats));
  }, []);

  if (!stats) return <div>Loading...</div>;

  const pieData = [
    { name: 'Present', value: stats.todayPresent, color: '#16a34a' },
    { name: 'Late', value: stats.todayLate, color: '#ca8a04' },
    { name: 'Absent', value: stats.todayAbsent, color: '#dc2626' },
  ];

  const barData = [
    { name: 'Present', count: stats.todayPresent },
    { name: 'Late', count: stats.todayLate },
    { name: 'Absent', count: stats.todayAbsent },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={FiUsers} color="primary" />
        <StatCard title="Approved" value={stats.approvedEmployees} icon={FiUserCheck} color="green" />
        <StatCard title="Pending Registrations" value={stats.pendingRegistrations} icon={FiClock} color="yellow" />
        <StatCard title="Pending Face Approvals" value={stats.pendingFaces} icon={FiCheckCircle} color="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Today's Attendance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today Present" value={stats.todayPresent} icon={FiCheckCircle} color="green" />
        <StatCard title="Today Late" value={stats.todayLate} icon={FiClock} color="yellow" />
        <StatCard title="Today Absent" value={stats.todayAbsent} icon={FiXCircle} color="red" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FiFileText} color="blue" />
      </div>
    </div>
  );
}