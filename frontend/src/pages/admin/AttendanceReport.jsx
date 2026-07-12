import { useEffect, useState } from 'react';
import api from '../../api/client';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';

export default function AttendanceReport() {
  const [data, setData] = useState({ records: [], page: 1, pages: 1 });
  const [filters, setFilters] = useState({ from: '', to: '', status: '', department: '' });

  const load = (page = 1) => {
    const p = new URLSearchParams({ page });
    Object.entries(filters).forEach(([k, v]) => v && p.append(k, v));
    api.get(`/admin/attendance/report?${p}`).then((r) => setData(r.data));
  };

  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.append(k, v));
    window.open(`/api/admin/attendance/export?${p}`, '_blank');
  };

  const columns = [
    { key: 'user', label: 'Employee', render: (r) => <div><div className="font-medium">{r.user?.name}</div><div className="text-xs text-slate-500">{r.user?.employeeId}</div></div> },
    { key: 'department', label: 'Dept', render: (r) => r.user?.department },
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'checkIn', label: 'In', render: (r) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—' },
    { key: 'checkOut', label: 'Out', render: (r) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—' },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        const c = { present: 'bg-green-100 text-green-700', late: 'bg-yellow-100 text-yellow-700', absent: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${c[r.status]}`}>{r.status}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Attendance Report</h1>
        <button onClick={exportCsv} className="btn-secondary">Export CSV</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <input type="date" className="input max-w-[180px]" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" className="input max-w-[180px]" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <input className="input max-w-[180px]" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        <select className="input max-w-[180px]" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
        <button onClick={() => load(1)} className="btn-primary">Apply</button>
      </div>
      <Table columns={columns} data={data.records} />
      <Pagination page={data.page} pages={data.pages} onChange={load} />
    </div>
  );
}