import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  photos: [String],
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
