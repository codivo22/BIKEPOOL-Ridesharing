import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const refreshRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { reviewedUser: userId } },
    { $group: { _id: '$reviewedUser', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  await User.findByIdAndUpdate(userId, { averageRating: stats[0]?.average || 0, reviewCount: stats[0]?.count || 0 });
};

export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment = '' } = req.body;
  const booking = await Booking.findById(bookingId).populate('ride');
  if (!booking || booking.status !== 'completed') {
    res.status(400);
    throw new Error('Reviews are available only after a completed ride.');
  }
  const isPassenger = booking.passenger.equals(req.user._id);
  const isOwner = booking.ride.owner.equals(req.user._id);
  if (!isPassenger && !isOwner) {
    res.status(403);
    throw new Error('You were not part of this ride.');
  }
  const reviewedUser = isPassenger ? booking.ride.owner : booking.passenger;
  const review = await Review.create({ ride: booking.ride._id, booking: booking._id, reviewer: req.user._id, reviewedUser, rating, comment });
  await refreshRating(reviewedUser);
  res.status(201).json({ review });
});

export const getReviewsForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedUser: req.params.userId }).populate('reviewer', 'name profilePhoto').sort('-createdAt');
  res.json({ reviews });
});
