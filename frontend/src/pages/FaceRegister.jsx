import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import FaceCamera from '../components/FaceCamera';

export default function FaceRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [faceStatus, setFaceStatus] = useState('loading');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const nav = useNavigate();
  const { refreshUser, user } = useAuth();

  // Check current face status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/face/status');
        setFaceStatus(res.data.status);
        setRejectionReason(res.data.rejectionReason || '');
        
        if (res.data.status === 'approved') {
          toast.success('Your face is already approved!');
          nav('/dashboard');
        } else if (res.data.status === 'pending') {
          toast('Your face registration is pending admin approval', {
            icon: 'ℹ️',
          });
        } else if (res.data.status === 'rejected') {
          toast.error(`Previous registration rejected: ${res.data.rejectionReason || 'No reason given'}`);
        }
      } catch (err) {
        console.error('Failed to check face status:', err);
      }
    };
    
    checkStatus();
  }, [nav]);

  const handleCapture = async (samples) => {
    setSubmitting(true);
    try {
      const res = await api.post('/face/register', { samples });
      
      toast.success(res.data.message || 'Face submitted for admin approval');
      
      // Update user data
      await refreshUser();
      
      // Show waiting message
      toast('Please wait for admin approval. You can check notifications for updates.', {
        icon: 'ℹ️',
      });
      
      // Navigate after a delay
      setTimeout(() => {
        nav('/dashboard');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to register face';
      toast.error(message);
      
      // If face already exists, redirect to dashboard
      if (err.response?.status === 409) {
        setTimeout(() => {
          nav('/dashboard');
        }, 2000);
      } else {
        setSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    console.log('🚫 User clicked cancel - showing confirmation');
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    console.log('✅ User confirmed cancel');
    setShowCancelConfirm(false);
    nav('/dashboard');
    toast('Face registration cancelled', {
      icon: 'ℹ️',
    });
  };

  const cancelCancel = () => {
    console.log(' User cancelled the cancel - continuing registration');
    setShowCancelConfirm(false);
    toast('Continuing face registration');
  };

  if (faceStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-2">Register Your Face</h2>
          
          {faceStatus === 'rejected' && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 font-medium">Previous Registration Rejected</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Reason: {rejectionReason || 'Not specified'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Please submit a new registration with better quality images.
              </p>
            </div>
          )}
          
          {faceStatus === 'pending' && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Pending Approval</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Your previous submission is waiting for admin approval.
              </p>
            </div>
          )}
          
          <p className="text-sm text-slate-500 mb-4">
            We'll capture 5 samples. Admin will approve before you can mark attendance.
          </p>
          
          <FaceCamera 
            mode="register" 
            onCapture={handleCapture} 
            onClose={handleClose}
            requireLiveness={false} 
          />
          
          {submitting && (
            <div className="text-center mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
              <span className="text-primary-600">Submitting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-3">Cancel Registration?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to cancel face registration? You won't be able to check in until you register your face.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelCancel} 
                className="btn-secondary"
              >
                Continue Registration
              </button>
              <button 
                onClick={confirmCancel} 
                className="btn-danger"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}