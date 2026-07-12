import { useEffect, useState } from 'react';
import api from '../../api/client';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📬 Fetching notifications...');
      const res = await api.get('/notifications');
      
      console.log('✅ Notifications response:', res.data);
      console.log(`   Total: ${res.data.notifications?.length || 0}`);
      console.log(`   Unread: ${res.data.unread || 0}`);
      
      setList(res.data.notifications || []);
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchNotifications(); 
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read', { ids: list.map(n => n._id) });
      setList(list.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.post('/notifications/read', { ids: [id] });
      setList(list.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error('Failed');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setList(list.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const unreadCount = list.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button onClick={fetchNotifications} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-red-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
            <FiCheck /> Mark all read
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            <FiBell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          list.map((n) => (
            <div 
              key={n._id} 
              className={`card p-4 flex gap-3 transition ${
                n.read ? 'opacity-50' : 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.type === 'success' ? 'bg-green-100 text-green-600' :
                  n.type === 'error' ? 'bg-red-100 text-red-600' :
                  n.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-primary-100 text-primary-600'
                }`}
              >
                <FiBell />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium ${!n.read ? 'text-slate-900 dark:text-white' : ''}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{n.message}</p>
                <p className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {!n.read && (
                  <button 
                    onClick={() => markOneRead(n._id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                    title="Mark as read"
                  >
                    <FiCheck size={16} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(n._id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}