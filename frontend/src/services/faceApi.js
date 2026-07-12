import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Use CDN
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const loadModels = async () => {
  if (modelsLoaded) {
    console.log('✅ Models already loaded');
    return;
  }
  
  try {
    console.log('📦 Starting to load face-api models from CDN...');
    console.log('Model URL:', MODEL_URL);
    
    // Load each model one by one with logging
    console.log('Loading tinyFaceDetector...');
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    console.log('✅ tinyFaceDetector loaded');
    
    console.log('Loading faceLandmark68Net...');
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    console.log('✅ faceLandmark68Net loaded');
    
    console.log('Loading faceRecognitionNet...');
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log('✅ faceRecognitionNet loaded');
    
    console.log('Loading faceExpressionNet...');
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    console.log('✅ faceExpressionNet loaded');
    
    modelsLoaded = true;
    console.log('🎉 All models loaded successfully!');
    
  } catch (err) {
    console.error('❌ Failed to load models:', err);
    console.error('Error details:', err.message);
    throw new Error(`Failed to load face models: ${err.message}`);
  }
};

export const detectFace = async (video, options) => {
  return faceapi
    .detectSingleFace(video, options || new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
};

export const detectAllFaces = async (video) => {
  return faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
};

export const computeEAR = (landmarks) => {
  const positions = landmarks.positions;
  const ear = (eye) => {
    const p = eye.map((i) => positions[i]);
    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);
    return (v1 + v2) / (2.0 * h);
  };
  const left = ear([36, 37, 38, 39, 40, 41]);
  const right = ear([42, 43, 44, 45, 46, 47]);
  return (left + right) / 2;
};

export const EAR_THRESHOLD = 0.22;