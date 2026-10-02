import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  model: { type: String, required: true, trim: true, maxlength: 80 },
  registrationNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
  color: { type: String, trim: true, maxlength: 30, default: '' },
  availableSeats: { type: Number, required: true, min: 1, max: 1, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

bikeSchema.index({ owner: 1, registrationNumber: 1 }, { unique: true });
export default mongoose.model('Bike', bikeSchema);
