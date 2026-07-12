import { useEffect, useState } from 'react';
import api from '../../api/client';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function LeavesReview() {
  const [data, setData] = useState({ leaves: [], page: 1, pages: 1, total: 0 });
  const [reviewModal, setReviewModal] = useState(null);
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    console.log('📬 Fetching leave requests...');
    
    // ✅ FIXED: Use /leaves/all instead of /admin/leaves/all
    api.get(`/leaves/all?page=${page}`)
      .then((r) => {
        console.log('✅ Leave requests response:', r.data);
        setData({
          leaves: r.data.leaves || [],
          page: r.data.page,
          pages: r.data.pages,
          total: r.data.total,
        });
      })
      .catch((err) => {
        console.error('❌ Failed to load leaves:', err);
        toast.error('Failed to load leave requests');
        setData({ leaves: [], page: 1, pages: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    load(); 
  }, []);

  const submit = async () => {
    if (!reviewModal) return;
    
    try {
      // ✅ FIXED: Use /leaves/:id/review instead of /admin/leaves/:id/review
      await api.put(`/leaves/${reviewModal._id}/review`, { status, reviewNote: note });
      toast.success(`Leave ${status} successfully`);
      setReviewModal(null);
      setNote('');
      load(data.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Employee', 
      render: (r) => (
        <div>
          <div className="font-medium">{r.user?.name}</div>
          <div className="text-xs text-slate-500">{r.user?.employeeId}</div>
        </div>
      ) 
    },
    { key: 'type', label: 'Type', render: (r) => r.type?.toUpperCase() || 'N/A' },
    { key: 'start', label: 'From', render: (r) => r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN') : 'N/A' },
    { key: 'end', label: 'To', render: (r) => r.endDate ? new Date(r.endDate).toLocaleDateString('en-IN') : 'N/A' },
    { 
      key: 'reason', 
      label: 'Reason',
      render: (r) => (
        <div className="max-w-xs truncate" title={r.reason}>
          {r.reason || 'N/A'}
        </div>
      )
    },
    {
      key: 'status', 
      label: 'Status',
      render: (r) => {
        const c = {
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${c[r.status] || 'bg-slate-100'}`}>
            {r.status?.toUpperCase() || 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'actions', 
      label: 'Action',
      render: (r) => 
        r.status === 'pending' ? (
          <div className="flex gap-2">
            <button 
              onClick={() => { setReviewModal(r); setStatus('approved'); }} 
              className="btn-primary text-xs px-3 py-1"
            >
              Approve
            </button>
            <button 
              onClick={() => { setReviewModal(r); setStatus('rejected'); }} 
              className="btn-danger text-xs px-3 py-1"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Processed</span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        {data.total > 0 && (
          <p className="text-sm text-slate-500">Total: {data.total}</p>
        )}
      </div>
      
      <Table columns={columns} data={data.leaves} emptyText="No leave requests found" />
      
      {data.pages > 1 && (
        <Pagination page={data.page} pages={data.pages} onChange={load} />
      )}

      <Modal 
        open={!!reviewModal} 
        onClose={() => { setReviewModal(null); setNote(''); }} 
        title="Review Leave Request"
        size="md"
      >
        {reviewModal && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p><strong>Employee:</strong> {reviewModal.user?.name}</p>
              <p><strong>Type:</strong> {reviewModal.type?.toUpperCase()}</p>
              <p><strong>Duration:</strong> {new Date(reviewModal.startDate).toLocaleDateString('en-IN')} → {new Date(reviewModal.endDate).toLocaleDateString('en-IN')}</p>
              <p><strong>Reason:</strong> {reviewModal.reason}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Action</label>
              <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <textarea 
                className="input mt-1" 
                rows={2} 
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setReviewModal(null); setNote(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={submit} className={status === 'approved' ? 'btn-primary flex-1' : 'btn-danger flex-1'}>
                {status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}