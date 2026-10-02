import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

const publicUser = (user) => user.toJSON();

const respondWithUser = (res, user, statusCode = 200) => {
  res.status(statusCode).json({ user: publicUser(user), token: generateToken(user._id) });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, collegeOrOrganization = '', profilePhoto = '' } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('Name, email, phone, and password are required.');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }
  const user = await User.create({ name, email, phone, password, collegeOrOrganization, profilePhoto });
  respondWithUser(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) {
    res.status(401);
    throw new Error('Incorrect email or password.');
  }
  if (user.status !== 'active') {
    res.status(403);
    throw new Error('Your account has been suspended.');
  }
  respondWithUser(res, user);
});

export const getMe = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'profilePhoto', 'collegeOrOrganization', 'bio', 'paymentPreference', 'upiId', 'messagePreference'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-phone -email');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json({ user });
});
