import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  reason: { type: String, required: true, enum: ['safety', 'behaviour', 'fake_profile', 'spam', 'other'] },
  description: { type: String, required: true, trim: true, maxlength: 600 },
  status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' },
  adminNote: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
