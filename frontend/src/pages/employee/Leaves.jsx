import { useEffect, useState } from 'react';
import api from '../../api/client';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    type: 'casual', startDate: '', endDate: '', reason: '',
  });

  const load = () => api.get('/leaves/my').then((r) => setLeaves(r.data.leaves));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave applied');
      setShow(false);
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (r) => r.type.toUpperCase() },
    { key: 'start', label: 'From', render: (r) => new Date(r.startDate).toLocaleDateString() },
    { key: 'end', label: 'To', render: (r) => new Date(r.endDate).toLocaleDateString() },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        const c = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${c[r.status]}`}>{r.status}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Leaves</h1>
        <button onClick={() => setShow(true)} className="btn-primary">Apply Leave</button>
      </div>
      <Table columns={columns} data={leaves} />

      <Modal open={show} onClose={() => setShow(false)} title="Apply Leave">
        <form onSubmit={submit} className="space-y-3">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
            <option value="unpaid">Unpaid</option>
            <option value="other">Other</option>
          </select>
          <input type="date" className="input" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input type="date" className="input" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <textarea className="input" rows={3} placeholder="Reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button className="btn-primary w-full">Submit</button>
        </form>
      </Modal>
    </div>
  );
}