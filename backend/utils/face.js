/**
 * Euclidean distance between two 128-d face descriptors.
 * face-api.js default threshold is ~0.6.
 */
exports.euclideanDistance = (a, b) => {
  if (a.length !== b.length) throw new Error('Descriptor length mismatch');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
};

exports.FACE_MATCH_THRESHOLD = 0.6;

/**
 * Find best matching user from a list of approved face embeddings.
 * Returns { user, distance } or null.
 */
exports.findBestMatch = (descriptor, embeddingsList) => {
  let best = null;
  for (const emb of embeddingsList) {
    if (!emb.aggregateDescriptor || emb.status !== 'approved') continue;
    const dist = exports.euclideanDistance(descriptor, emb.aggregateDescriptor);
    if (dist <= exports.FACE_MATCH_THRESHOLD) {
      if (!best || dist < best.distance) {
        best = { user: emb.user, distance: dist, embedding: emb };
      }
    }
  }
  return best;
};

/**
 * Check if a descriptor is already registered to another user.
 */
exports.isDuplicateFace = (descriptor, embeddingsList, excludeUserId) => {
  for (const emb of embeddingsList) {
    if (excludeUserId && emb.user.toString() === excludeUserId.toString()) continue;
    if (!emb.aggregateDescriptor) continue;
    const dist = exports.euclideanDistance(descriptor, emb.aggregateDescriptor);
    if (dist <= exports.FACE_MATCH_THRESHOLD) return true;
  }
  return false;
};

/**
 * Compute average descriptor from an array of descriptors.
 */
exports.averageDescriptor = (descriptors) => {
  if (!descriptors.length) return null;
  const avg = new Array(128).fill(0);
  for (const d of descriptors) {
    for (let i = 0; i < 128; i++) avg[i] += d[i];
  }
  for (let i = 0; i < 128; i++) avg[i] /= descriptors.length;
  return avg;
};