import Bike from '../models/Bike.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyBikes = asyncHandler(async (req, res) => {
  const bikes = await Bike.find({ owner: req.user._id }).sort('-createdAt');
  res.json({ bikes });
});

export const createBike = asyncHandler(async (req, res) => {
  const { model, registrationNumber, color = '', availableSeats = 1 } = req.body;
  if (!model || !registrationNumber) {
    res.status(400);
    throw new Error('Bike model and registration number are required.');
  }
  const bike = await Bike.create({ owner: req.user._id, model, registrationNumber, color, availableSeats });
  res.status(201).json({ bike });
});

export const updateBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findOne({ _id: req.params.bikeId, owner: req.user._id });
  if (!bike) {
    res.status(404);
    throw new Error('Bike not found.');
  }
  ['model', 'registrationNumber', 'color', 'isActive'].forEach((field) => {
    if (req.body[field] !== undefined) bike[field] = req.body[field];
  });
  await bike.save();
  res.json({ bike });
});
