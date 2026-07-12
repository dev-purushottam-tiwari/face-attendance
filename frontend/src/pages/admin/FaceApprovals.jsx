import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

export default function FaceApprovals() {
  const [faces, setFaces] = useState([]);
  const [reason, setReason] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [loading, setLoading] = useState(true);

 const load = () => {
  setLoading(true);
  console.log(' Fetching pending face requests...');
  
  api.get('/admin/faces/pending')
    .then((r) => {
      console.log('✅ Received face requests:', r.data);
      console.log('Count:', r.data.count || r.data.faces?.length);
      setFaces(r.data.faces || []);
      
      if (!r.data.faces || r.data.faces.length === 0) {
        console.warn('⚠️  No pending faces returned from API');
      }
    })
    .catch((err) => {
      console.error('❌ Failed to load faces:', err);
      toast.error('Failed to load face requests');
    })
    .finally(() => setLoading(false));
};
  
  useEffect(() => { 
    load(); 
  }, []);

  const approve = async (id) => {
    try {
      await api.post(`/admin/faces/${id}/approve`);
      toast.success('Face approved successfully');
      load(); // Reload list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };
  
  const reject = async () => {
    try {
      if (!reason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      
      await api.post(`/admin/faces/${rejectId}/reject`, { reason });
      toast.success('Face rejected');
      setRejectId(null);
      setReason('');
      load(); // Reload list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Face Registration Requests</h1>
      
      {faces.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          <p className="text-lg mb-2">No pending requests</p>
          <p className="text-sm">All face registrations have been processed</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faces.map((f) => (
          <div key={f._id} className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                {f.user?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{f.user?.name}</p>
                <p className="text-xs text-slate-500">{f.user?.employeeId}</p>
              </div>
            </div>
            
            <div className="space-y-1 text-sm mb-3">
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Email:</span> {f.user?.email}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Department:</span> {f.user?.department}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Samples:</span> {f.samples?.length || 0}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => approve(f._id)} 
                className="btn-primary flex-1 text-sm"
              >
                Approve
              </button>
              <button 
                onClick={() => setRejectId(f._id)} 
                className="btn-danger flex-1 text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        open={!!rejectId} 
        onClose={() => { setRejectId(null); setReason(''); }} 
        title="Reject Face Registration"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Provide a reason for rejection. The employee will be notified and can submit a new registration.
          </p>
          <textarea 
            className="input" 
            rows={4} 
            placeholder="e.g., Poor image quality, face not clear, multiple faces detected, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3">
            <button 
              onClick={() => { setRejectId(null); setReason(''); }} 
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={reject} 
              className="btn-danger flex-1"
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}