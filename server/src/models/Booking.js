import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pickupPoint: { type: String, trim: true, maxlength: 140, default: '' },
  message: { type: String, trim: true, maxlength: 250, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending', index: true },
  respondedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });
export default mongoose.model('Booking', bookingSchema);
