import Report from '../models/Report.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReport = asyncHandler(async (req, res) => {
  const { reportedUser, ride, reason, description } = req.body;
  if (!reason || !description) {
    res.status(400);
    throw new Error('Reason and description are required.');
  }
  const report = await Report.create({ reporter: req.user._id, reportedUser, ride, reason, description });
  res.status(201).json({ report });
});

export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id }).populate('reportedUser', 'name').populate('ride', 'source destination').sort('-createdAt');
  res.json({ reports });
});
