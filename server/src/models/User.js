import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  password: { type: String, required: true, minlength: 6, select: false },
  profilePhoto: { type: String, default: '' },
  collegeOrOrganization: { type: String, trim: true, maxlength: 120, default: '' },
  bio: { type: String, trim: true, maxlength: 280, default: '' },
  paymentPreference: { type: String, enum: ['cash', 'upi', 'wallet', 'none'], default: 'cash' },
  upiId: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
  messagePreference: { type: Boolean, default: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (document, returned) => {
      delete returned.password;
      return returned;
    }
  },
  toObject: { virtuals: true }
});

userSchema.virtual('initials').get(function getInitials() {
  return this.name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
