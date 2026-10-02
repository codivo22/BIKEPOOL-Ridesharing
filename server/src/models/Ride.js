import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 140 },
  coordinates: {
    type: [Number],
    validate: { validator: (value) => !value?.length || value.length === 2, message: 'Coordinates must contain longitude and latitude.' },
    default: []
  }
}, { _id: false });

const rideSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bike: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  source: { type: locationSchema, required: true },
  destination: { type: locationSchema, required: true },
  departureAt: { type: Date, required: true, index: true },
  totalSeats: { type: Number, required: true, min: 1, max: 1, default: 1 },
  availableSeats: { type: Number, required: true, min: 0, max: 1, default: 1 },
  contribution: { type: Number, required: true, min: 0, max: 5000 },
  notes: { type: String, trim: true, maxlength: 300, default: '' },
  status: { type: String, enum: ['published', 'full', 'completed', 'cancelled'], default: 'published', index: true }
}, { timestamps: true });

rideSchema.index({ 'source.label': 'text', 'destination.label': 'text' });
export default mongoose.model('Ride', rideSchema);
