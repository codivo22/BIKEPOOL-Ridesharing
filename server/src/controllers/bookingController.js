import Booking from '../models/Booking.js';
import Ride from '../models/Ride.js';
import { createNotification } from '../utils/createNotification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const bookingDetails = (query) => query
  .populate({ path: 'ride', populate: [{ path: 'owner', select: 'name profilePhoto averageRating reviewCount' }, { path: 'bike', select: 'model color' }] })
  .populate('passenger', 'name profilePhoto collegeOrOrganization averageRating reviewCount');

export const createBooking = asyncHandler(async (req, res) => {
  const { rideId, pickupPoint = '', message = '' } = req.body;
  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== 'published' || ride.departureAt <= new Date()) {
    res.status(400);
    throw new Error('This ride is no longer available.');
  }
  if (ride.owner.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot request a seat on your own ride.');
  }
  if (ride.availableSeats < 1) {
    res.status(400);
    throw new Error('No seats are available on this ride.');
  }
  const booking = await Booking.create({ ride: ride._id, passenger: req.user._id, pickupPoint, message });
  await createNotification({ recipient: ride.owner, type: 'booking_request', title: 'New ride request', message: `${req.user.name} requested a seat on your ride.`, relatedRide: ride._id, relatedBooking: booking._id });
  res.status(201).json({ booking: await bookingDetails(Booking.findById(booking._id)) });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingDetails(Booking.find({ passenger: req.user._id }).sort('-createdAt'));
  res.json({ bookings });
});

export const getReceivedBookings = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ owner: req.user._id }).select('_id');
  const bookings = await bookingDetails(Booking.find({ ride: { $in: rides.map((ride) => ride._id) } }).sort('-createdAt'));
  res.json({ bookings });
});

export const respondToBooking = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be accepted or rejected.');
  }
  const booking = await Booking.findById(req.params.bookingId).populate('ride');
  if (!booking || !booking.ride.owner.equals(req.user._id)) {
    res.status(404);
    throw new Error('Booking request not found.');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been handled.');
  }
  if (status === 'accepted') {
    const updatedRide = await Ride.findOneAndUpdate({ _id: booking.ride._id, availableSeats: { $gt: 0 }, status: 'published' }, { $inc: { availableSeats: -1 } }, { new: true });
    if (!updatedRide) {
      res.status(400);
      throw new Error('No seats remain on this ride.');
    }
    if (updatedRide.availableSeats === 0) {
      updatedRide.status = 'full';
      await updatedRide.save();
    }
  }
  booking.status = status;
  booking.respondedAt = new Date();
  await booking.save();
  await createNotification({
    recipient: booking.passenger, type: status === 'accepted' ? 'booking_accepted' : 'booking_rejected',
    title: status === 'accepted' ? 'Ride request accepted' : 'Ride request declined',
    message: status === 'accepted' ? `Your seat on the ride to ${booking.ride.destination.label} is confirmed.` : `Your request for the ride to ${booking.ride.destination.label} was declined.`,
    relatedRide: booking.ride._id, relatedBooking: booking._id
  });
  res.json({ booking: await bookingDetails(Booking.findById(booking._id)) });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.bookingId, passenger: req.user._id }).populate('ride');
  if (!booking || !['pending', 'accepted'].includes(booking.status)) {
    res.status(400);
    throw new Error('This booking cannot be cancelled.');
  }
  const wasAccepted = booking.status === 'accepted';
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();
  if (wasAccepted && !['completed', 'cancelled'].includes(booking.ride.status)) {
    booking.ride.availableSeats = Math.min(booking.ride.totalSeats, booking.ride.availableSeats + 1);
    booking.ride.status = 'published';
    await booking.ride.save();
  }
  await createNotification({ recipient: booking.ride.owner, type: 'booking_cancelled', title: 'Booking cancelled', message: `${req.user.name} cancelled their ride request.`, relatedRide: booking.ride._id, relatedBooking: booking._id });
  res.json({ booking });
});
