import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;

export const initMediaPipe = async () => {
  if (faceLandmarker) return faceLandmarker;
  
  try {
    console.log('📦 Loading MediaPipe FaceLandmarker...');
    
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });
    
    console.log('✅ MediaPipe FaceLandmarker loaded');
    return faceLandmarker;
  } catch (err) {
    console.error('❌ MediaPipe load failed:', err);
    throw err;
  }
};

// Detect face with MediaPipe - returns landmarks and blendshapes
export const detectFaceMediaPipe = async (video, timestamp) => {
  if (!faceLandmarker) await initMediaPipe();
  
  try {
    const results = faceLandmarker.detectForVideo(video, timestamp || performance.now());
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      return {
        landmarks: results.faceLandmarks[0],
        blendshapes: results.faceBlendshapes?.[0]?.categories || [],
        transformationMatrix: results.facialTransformationMatrixes?.[0],
        detected: true,
      };
    }
    
    return { detected: false };
  } catch (err) {
    console.error('MediaPipe detection error:', err);
    return { detected: false };
  }
};

// Get eye blink score from blendshapes
export const getBlinkScore = (blendshapes) => {
  if (!blendshapes) return 0;
  
  const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft');
  const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight');
  
  if (!eyeBlinkLeft || !eyeBlinkRight) return 0;
  
  return (eyeBlinkLeft.score + eyeBlinkRight.score) / 2;
};

// Get head pose from transformation matrix
export const getHeadPose = (transformationMatrix) => {
  if (!transformationMatrix || !transformationMatrix.data) {
    return { yaw: 0, pitch: 0, roll: 0 };
  }
  
  const m = transformationMatrix.data;
  const yaw = Math.atan2(m[0], m[8]) * (180 / Math.PI);
  const pitch = Math.atan2(-m[4], Math.sqrt(m[5] * m[5] + m[6] * m[6])) * (180 / Math.PI);
  
  return { yaw, pitch };
};