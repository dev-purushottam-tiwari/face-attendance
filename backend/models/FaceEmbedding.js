const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Each user can have multiple registered face samples
    samples: [
      {
        // 128-d face descriptor (face-api.js)
        descriptor: { type: [Number], required: true, validate: (v) => v.length === 128 },
        quality: { type: Number, min: 0, max: 1 }, // detection confidence
      },
    ],
    // Aggregate embedding (average of samples) for fast matching
    aggregateDescriptor: { type: [Number], validate: (v) => !v || v.length === 128 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
  },
  { timestamps: true }
);

faceEmbeddingSchema.index({ user: 1 }, { unique: true });
faceEmbeddingSchema.index({ status: 1 });

module.exports = mongoose.model('FaceEmbedding', faceEmbeddingSchema);