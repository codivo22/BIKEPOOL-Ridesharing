import Booking from '../models/Booking.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [users, rides, bookings, openReports, completedRides] = await Promise.all([
    User.countDocuments(), Ride.countDocuments(), Booking.countDocuments(), Report.countDocuments({ status: { $in: ['open', 'reviewing'] } }), Ride.countDocuments({ status: 'completed' })
  ]);
  res.json({ stats: { users, rides, bookings, openReports, completedRides } });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt').limit(100);
  res.json({ users });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status) || req.params.userId === String(req.user._id)) {
    res.status(400);
    throw new Error('That account status update is not allowed.');
  }
  const user = await User.findByIdAndUpdate(req.params.userId, { status }, { new: true }).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json({ user });
});

export const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find().populate('reporter', 'name email').populate('reportedUser', 'name email').populate('ride', 'source destination').sort('-createdAt').limit(100);
  res.json({ reports });
});

export const updateReport = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.reportId, { status, adminNote }, { new: true });
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  res.json({ report });
});

export const listActivity = asyncHandler(async (req, res) => {
  const [rides, bookings, reviews] = await Promise.all([
    Ride.find().populate('owner', 'name').sort('-createdAt').limit(10),
    Booking.find().populate('passenger', 'name').sort('-createdAt').limit(10),
    Review.find().populate('reviewer reviewedUser', 'name').sort('-createdAt').limit(10)
  ]);
  res.json({ rides, bookings, reviews });
});

export const listReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate('reviewer reviewedUser', 'name').populate('ride', 'source destination').sort('-createdAt').limit(100);
  res.json({ reviews });
});

export const removeReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  const stats = await Review.aggregate([{ $match: { reviewedUser: review.reviewedUser } }, { $group: { _id: '$reviewedUser', average: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await User.findByIdAndUpdate(review.reviewedUser, { averageRating: stats[0]?.average || 0, reviewCount: stats[0]?.count || 0 });
  res.json({ success: true });
});
