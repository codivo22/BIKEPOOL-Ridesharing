import Bike from '../models/Bike.js';
import Booking from '../models/Booking.js';
import Ride from '../models/Ride.js';
import { createNotification } from '../utils/createNotification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const rideDetails = (query) => query.populate('owner', 'name profilePhoto collegeOrOrganization averageRating reviewCount').populate('bike', 'model registrationNumber color');

const cleanLocation = (location) => ({ label: location?.label?.trim(), coordinates: location?.coordinates || [] });

export const listRides = asyncHandler(async (req, res) => {
  const { source, destination, date, seats } = req.query;
  const filters = { status: { $in: ['published', 'full'] }, departureAt: { $gte: new Date() } };
  if (source) filters['source.label'] = { $regex: source, $options: 'i' };
  if (destination) filters['destination.label'] = { $regex: destination, $options: 'i' };
  if (seats) filters.availableSeats = { $gte: Number(seats) };
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    filters.departureAt = { $gte: start, $lte: end };
  }
  const rides = await rideDetails(Ride.find(filters).sort('departureAt').limit(50));
  res.json({ rides });
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await rideDetails(Ride.findById(req.params.rideId));
  if (!ride) {
    res.status(404);
    throw new Error('Ride not found.');
  }
  res.json({ ride });
});

export const getMyRides = asyncHandler(async (req, res) => {
  const rides = await rideDetails(Ride.find({ owner: req.user._id }).sort('-departureAt'));
  res.json({ rides });
});

export const createRide = asyncHandler(async (req, res) => {
  const { bikeId, source, destination, departureAt, contribution, notes = '' } = req.body;
  const bike = await Bike.findOne({ _id: bikeId, owner: req.user._id, isActive: true });
  if (!bike) {
    res.status(400);
    throw new Error('Select one of your active bikes first.');
  }
  const cleanSource = cleanLocation(source);
  const cleanDestination = cleanLocation(destination);
  if (!cleanSource.label || !cleanDestination.label || !departureAt || contribution === undefined) {
    res.status(400);
    throw new Error('Bike, source, destination, departure date/time, and contribution are required.');
  }
  if (new Date(departureAt) <= new Date()) {
    res.status(400);
    throw new Error('Departure time must be in the future.');
  }
  const ride = await Ride.create({
    owner: req.user._id, bike: bike._id, source: cleanSource, destination: cleanDestination,
    departureAt, totalSeats: bike.availableSeats, availableSeats: bike.availableSeats, contribution, notes
  });
  const populatedRide = await rideDetails(Ride.findById(ride._id));
  res.status(201).json({ ride: populatedRide });
});

export const cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.rideId, owner: req.user._id });
  if (!ride) {
    res.status(404);
    throw new Error('Ride not found.');
  }
  if (['completed', 'cancelled'].includes(ride.status)) {
    res.status(400);
    throw new Error('This ride cannot be cancelled.');
  }
  ride.status = 'cancelled';
  await ride.save();
  const bookings = await Booking.find({ ride: ride._id, status: { $in: ['pending', 'accepted'] } });
  await Booking.updateMany({ _id: { $in: bookings.map((booking) => booking._id) } }, { status: 'cancelled', cancelledAt: new Date() });
  await Promise.all(bookings.map((booking) => createNotification({
    recipient: booking.passenger, type: 'ride_cancelled', title: 'Ride cancelled',
    message: `Your ride from ${ride.source.label} to ${ride.destination.label} was cancelled.`, relatedRide: ride._id, relatedBooking: booking._id
  })));
  res.json({ ride });
});

export const completeRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.rideId, owner: req.user._id });
  if (!ride) {
    res.status(404);
    throw new Error('Ride not found.');
  }
  if (ride.status === 'cancelled') {
    res.status(400);
    throw new Error('A cancelled ride cannot be completed.');
  }
  ride.status = 'completed';
  await ride.save();
  await Booking.updateMany({ ride: ride._id, status: 'accepted' }, { status: 'completed' });
  res.json({ ride });
});
