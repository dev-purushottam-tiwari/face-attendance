import { useEffect, useState } from 'react';
import api from '../../api/client';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';

export default function History() {
  const [data, setData] = useState({ records: [], page: 1, pages: 1 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = (page = 1) => {
    const params = new URLSearchParams({ page, limit: 15 });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    api.get(`/attendance/history?${params}`).then((r) => setData(r.data));
  };

  useEffect(() => { load(); }, []);

  const formatTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatWorkingHours = (record) => {
    if (!record?.workingSeconds && record?.workingSeconds !== 0) return '—';
    
    const seconds = record.workingSeconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'checkIn', label: 'Check In', render: (r) => formatTime(r.checkIn) },
    { key: 'checkOut', label: 'Check Out', render: (r) => formatTime(r.checkOut) },
    {
      key: 'hours', label: 'Working Hours',
      render: (r) => formatWorkingHours(r),
    },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        const colors = {
          present: 'bg-green-100 text-green-700',
          late: 'bg-yellow-100 text-yellow-700',
          absent: 'bg-red-100 text-red-700',
          'half-day': 'bg-blue-100 text-blue-700',
          'on-leave': 'bg-purple-100 text-purple-700',
        };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[r.status]}`}>{r.status}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Attendance History</h1>
      <div className="flex gap-2 flex-wrap">
        <input type="date" className="input max-w-[180px]" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input max-w-[180px]" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={() => load(1)} className="btn-primary">Apply</button>
      </div>
      <Table columns={columns} data={data.records} emptyText="No attendance records" />
      <Pagination page={data.page} pages={data.pages} onChange={load} />
    </div>
  );
}