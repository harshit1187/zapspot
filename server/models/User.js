import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  vehicles: [{
    name: String,
    type: { type: String, enum: ['2-wheeler', '4-wheeler'] },
    batteryCapacity: Number,
    connector: String,
  }],
  rewards: {
    points: { type: Number, default: 0 },
    level: { type: String, default: 'Bronze' },
    carbonSaved: { type: Number, default: 0 },
    totalCharges: { type: Number, default: 0 },
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
