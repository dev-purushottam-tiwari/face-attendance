import { useEffect, useRef, useState } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { loadModels, detectFace } from '../services/faceApi';
import { initMediaPipe, detectFaceMediaPipe, getBlinkScore, getHeadPose } from '../services/mediapipeFace';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

export default function FaceCamera({ mode, onCapture, onVerify, requireLiveness = true, onClose }) {
  const { videoRef, error, start, stop } = useWebcam();
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [captured, setCaptured] = useState(0);
  const [livenessOk, setLivenessOk] = useState(!requireLiveness);
  const [processing, setProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [cameraStarted, setCameraStarted] = useState(false);
  
  const runningRef = useRef(true);
  const descriptorRef = useRef(null);
  const livenessRef = useRef({
    blinkCount: 0,
    eyeClosed: false,
    headTurnedLeft: false,
    headTurnedRight: false,
  });
  const modelsLoadedRef = useRef(false);

  // Load models once
  useEffect(() => {
    if (modelsLoadedRef.current) return;
    
    let cancelled = false;
    
    (async () => {
      try {
        setStatus('Loading AI models...');
        await Promise.all([
          initMediaPipe(),
          loadModels(),
        ]);
        modelsLoadedRef.current = true;
        
        if (!cancelled) {
          setStatus('Starting camera...');
          await start();
          
          if (!cancelled) {
            setReady(true);
            setCameraStarted(true);
            setStatus('Position your face in the frame');
          }
        }
      } catch (e) {
        console.error('Init error:', e);
        setStatus('Failed to initialize');
        toast.error('Failed to load face recognition: ' + e.message);
      }
    })();
    
    return () => { cancelled = true; };
  }, []); // Empty deps = runs once

  // Detection loop - only depends on ready state
  useEffect(() => {
    if (!ready || !cameraStarted) return;
    
    runningRef.current = true;
    let animationFrameId;
    
    const loop = async () => {
      if (!runningRef.current || !videoRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        try {
          const mpResult = await detectFaceMediaPipe(video, performance.now());
          const faceApiResult = await detectFace(video);
          
          if (canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (faceApiResult) {
              faceapi.draw.drawDetections(canvas, faceApiResult.detection);
              faceapi.draw.drawFaceLandmarks(canvas, faceApiResult.landmarks);
              descriptorRef.current = Array.from(faceApiResult.descriptor);
            }
          }
          
          if (mpResult.detected && faceApiResult) {
            const blinkScore = getBlinkScore(mpResult.blendshapes);
            const headPose = getHeadPose(mpResult.transformationMatrix);
            
            setDebugInfo({
              blinkScore: blinkScore.toFixed(2),
              yaw: headPose.yaw.toFixed(1),
              pitch: headPose.pitch.toFixed(1),
              detected: true,
            });
            
            if (requireLiveness && mode === 'verify' && !livenessOk) {
              const state = livenessRef.current;
              
              if (blinkScore > 0.5) {
                if (!state.eyeClosed) state.eyeClosed = true;
              } else if (state.eyeClosed && blinkScore < 0.2) {
                state.eyeClosed = false;
                state.blinkCount += 1;
              }
              
              if (headPose.yaw < -15) state.headTurnedLeft = true;
              else if (headPose.yaw > 15) state.headTurnedRight = true;
              
              const passedBlink = state.blinkCount >= 2;
              const passedHead = state.headTurnedLeft && state.headTurnedRight;
              
              if (passedBlink || passedHead) {
                setLivenessOk(true);
                setStatus('✅ Liveness verified!');
                toast.success('Liveness verified!');
              } else {
                let hint = '';
                if (!passedBlink) hint = `Blink: ${state.blinkCount}/2`;
                if (!passedHead) hint += ` | Head: ${(state.headTurnedLeft ? 'L' : '-')}${(state.headTurnedRight ? 'R' : '-')}`;
                setStatus(`Hold still (${hint})`);
              }
            } else if (livenessOk) {
              setStatus('✅ Ready - Click Verify');
            } else {
              setStatus('Face detected');
            }
          } else {
            descriptorRef.current = null;
            setStatus('No face detected - move closer');
            setDebugInfo({ detected: false });
          }
        } catch (e) {
          console.error('Detection error:', e);
        }
      }
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();
    
    return () => {
      runningRef.current = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [ready, cameraStarted, requireLiveness, mode, livenessOk]);

  const handleRegister = async () => {
    setProcessing(true);
    const samples = [];
    
    try {
      for (let i = 0; i < 5; i++) {
        setStatus(`Capturing sample ${i + 1}/5...`);
        await new Promise(r => setTimeout(r, 800));
        
        if (descriptorRef.current && descriptorRef.current.length === 128) {
          samples.push({ descriptor: descriptorRef.current, quality: 0.95 });
          setCaptured(i + 1);
        } else {
          toast.warning('Face not detected, retrying...');
          i--;
        }
      }
      
      if (samples.length < 3) {
        toast.error('Could not capture enough samples');
        setCaptured(0);
        return;
      }
      
      // Stop camera AFTER successful capture
      stop();
      onCapture?.(samples);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed: ' + err.message);
      setCaptured(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (requireLiveness && !livenessOk) {
      toast.error('Please complete liveness check first');
      return;
    }
    
    if (!descriptorRef.current || descriptorRef.current.length !== 128) {
      toast.error('Face not detected. Please position your face in frame.');
      return;
    }
    
    setProcessing(true);
    setStatus('Matching with database...');
    
    try {
      // Stop camera AFTER successful verification
      stop();
      onVerify?.(descriptorRef.current);
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Verification failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    console.log('🚫 Camera stopped by user');
    stop();
    onClose?.();
  };

  const resetLiveness = () => {
    livenessRef.current = {
      blinkCount: 0,
      eyeClosed: false,
      headTurnedLeft: false,
      headTurnedRight: false,
    };
    setLivenessOk(false);
    toast.success('Liveness check reset');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {mode === 'register' ? 'Register Your Face' : 'Verify Identity'}
        </h3>
        <button 
          onClick={handleClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          title="Close camera"
        >
          <FiX size={20} />
        </button>
      </div>
      
      <div className="relative mx-auto w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full transform scale-x-[-1]"
        />
        
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
              <p className="text-lg font-semibold">{status}</p>
            </div>
          </div>
        )}
        
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black/60">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              {status}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold ${debugInfo.detected ? 'text-green-500' : 'text-red-500'}`}>
            {debugInfo.detected ? '✓ Face Detected' : '✗ No Face'}
          </span>
          <span className="text-xs text-slate-500">MediaPipe + face-api.js</span>
        </div>
        
        {debugInfo.detected && (
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500">Blink:</span>{' '}
              <span className="text-blue-600">{debugInfo.blinkScore}</span>
            </div>
            <div>
              <span className="text-slate-500">Yaw:</span>{' '}
              <span className="text-purple-600">{debugInfo.yaw}°</span>
            </div>
            <div>
              <span className="text-slate-500">Pitch:</span>{' '}
              <span className="text-orange-600">{debugInfo.pitch}°</span>
            </div>
          </div>
        )}
        
        <p className="mt-2 font-medium">{status}</p>
        
        {requireLiveness && mode === 'verify' && !livenessOk && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              💡 <strong>Blink twice</strong> OR <strong>turn head left + right</strong>
            </div>
            <button 
              onClick={resetLiveness}
              className="text-xs text-blue-500 hover:underline"
            >
              Reset liveness check
            </button>
          </div>
        )}
        
        {captured > 0 && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Captured {captured} samples
          </p>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {mode === 'register' && (
          <button 
            onClick={handleRegister} 
            disabled={!ready || processing || captured > 0} 
            className="btn-primary"
          >
            {processing ? 'Processing...' : captured > 0 ? `✓ ${captured} samples` : 'Capture 5 Samples'}
          </button>
        )}
        {mode === 'verify' && (
          <button 
            onClick={handleVerify} 
            disabled={!ready || processing || (requireLiveness && !livenessOk)} 
            className="btn-primary"
          >
            {processing ? 'Verifying...' : 'Verify Face'}
          </button>
        )}
      </div>
    </div>
  );
}