import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  stationName: { type: String, required: true },
  chargerId: { type: String, required: true },
  chargerType: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  cost: { type: Number, required: true },
  kwhDelivered: { type: Number, default: 0 },
  totalKwh: { type: Number, default: 0 },
  vehicle: { type: String, default: '' },
  qrCode: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
