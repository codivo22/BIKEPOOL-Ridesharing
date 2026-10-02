import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['booking_request', 'booking_accepted', 'booking_rejected', 'booking_cancelled', 'ride_cancelled', 'ride_reminder', 'system'], default: 'system' },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 280 },
  relatedRide: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
