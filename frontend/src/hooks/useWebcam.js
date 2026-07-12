import { useEffect, useRef, useState } from 'react';

export const useWebcam = (constraints) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const streamRef = useRef(null); // Keep reference to prevent cleanup issues

  const start = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const s = await navigator.mediaDevices.getUserMedia(
        constraints || {
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        }
      );
      
      streamRef.current = s;
      
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
      }
      
      setStream(s);
      setError(null);
      console.log(' Camera started successfully');
    } catch (e) {
      console.error('Camera error:', e);
      setError(e.message || 'Camera access denied');
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      console.log(' Camera stopped');
    }
  };

  // Only cleanup on actual unmount, not re-renders
  useEffect(() => {
    return () => {
      // This will only run when component truly unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return { videoRef, stream, error, start, stop };
};