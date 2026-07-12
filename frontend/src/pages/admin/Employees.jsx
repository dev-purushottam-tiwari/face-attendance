import { useEffect, useState } from 'react';
import api from '../../api/client';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function Employees() {
  const [data, setData] = useState({ users: [], page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const load = (page = 1) => {
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.append('search', search);
    if (filter) params.append(filter.split(':')[0], filter.split(':')[1]);
    api.get(`/admin/employees?${params}`).then((r) => setData(r.data));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.post(`/admin/employees/${id}/approve`);
    toast.success('Approved');
    load(data.page);
  };

  const reject = async () => {
    await api.post(`/admin/employees/${rejectModal}/reject`, { reason });
    toast.success('Rejected');
    setRejectModal(null);
    setReason('');
    load(data.page);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-slate-500">{r.email}</div></div> },
    { key: 'employeeId', label: 'ID' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'isApproved', label: 'Status',
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {r.isApproved ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'faceStatus', label: 'Face',
      render: (r) => {
        const c = { none: 'bg-slate-100 text-slate-600', pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${c[r.faceStatus]}`}>{r.faceStatus}</span>;
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (r) => !r.isApproved ? (
        <div className="flex gap-2">
          <button onClick={() => approve(r._id)} className="btn-primary text-xs px-3 py-1">Approve</button>
          <button onClick={() => setRejectModal(r._id)} className="btn-danger text-xs px-3 py-1">Reject</button>
        </div>
      ) : <span className="text-xs text-slate-500">—</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Employees</h1>
      <div className="flex gap-2 flex-wrap">
        <input className="input max-w-xs" placeholder="Search name/email/ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="isApproved:false">Pending</option>
          <option value="isApproved:true">Approved</option>
          <option value="faceStatus:pending">Face Pending</option>
        </select>
        <button onClick={() => load(1)} className="btn-primary">Search</button>
      </div>
      <Table columns={columns} data={data.users} />
      <Pagination page={data.page} pages={data.pages} onChange={load} />

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Employee">
        <textarea className="input" rows={3} placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button onClick={reject} className="btn-danger w-full mt-3">Confirm Reject</button>
      </Modal>
    </div>
  );
}