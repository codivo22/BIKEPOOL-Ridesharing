import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Please log in to continue.');
  }

  const token = authHeader.slice(7);
  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(userId);
  if (!user || user.status !== 'active') {
    res.status(401);
    throw new Error('This account is unavailable.');
  }
  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403);
    return next(new Error('Administrator access is required.'));
  }
  next();
};
