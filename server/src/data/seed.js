import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import Bike from '../models/Bike.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

const seed = async () => {
  try {
    await connectDatabase();
    const admin = await User.findOneAndUpdate(
      { email: 'admin@bikepool.demo' },
      { name: 'BikePool Admin', phone: '9000000000', collegeOrOrganization: 'BikePool Operations', role: 'admin', status: 'active' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!admin.password) {
      admin.password = 'Admin@123';
      await admin.save();
    }

    const rider = await User.findOneAndUpdate(
      { email: 'aarav@bikepool.demo' },
      { name: 'Aarav Sharma', phone: '9000000001', collegeOrOrganization: 'NIT Campus', bio: 'Daily commuter. Happy to help fellow students travel smarter.' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!rider.password) { rider.password = 'Demo@123'; await rider.save(); }

    const passenger = await User.findOneAndUpdate(
      { email: 'riya@bikepool.demo' },
      { name: 'Riya Verma', phone: '9000000002', collegeOrOrganization: 'NIT Campus', bio: 'Student and regular city commuter.' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!passenger.password) { passenger.password = 'Demo@123'; await passenger.save(); }

    let bike = await Bike.findOne({ owner: rider._id, registrationNumber: 'HR07BP2026' });
    if (!bike) bike = await Bike.create({ owner: rider._id, model: 'Honda Activa 6G', registrationNumber: 'HR07BP2026', color: 'Pearl White' });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 30, 0, 0);
    let ride = await Ride.findOne({ owner: rider._id, departureAt: tomorrow });
    if (!ride) {
      ride = await Ride.create({
        owner: rider._id, bike: bike._id,
        source: { label: 'NIT Campus Main Gate', coordinates: [76.8236, 29.9497] },
        destination: { label: 'Kurukshetra Railway Station', coordinates: [76.8471, 29.9695] },
        departureAt: tomorrow, totalSeats: 1, availableSeats: 1, contribution: 30,
        notes: 'Please be ready five minutes before departure.'
      });
    }
    await Notification.updateOne(
      { recipient: rider._id, title: 'Welcome to BikePool' },
      { $setOnInsert: { recipient: rider._id, type: 'system', title: 'Welcome to BikePool', message: 'Your demo account is ready. Create a ride or manage your profile.' } },
      { upsert: true }
    );
    console.log('\nDemo data is ready.');
    console.log('Admin: admin@bikepool.demo / Admin@123');
    console.log('Rider: aarav@bikepool.demo / Demo@123');
    console.log('Passenger: riya@bikepool.demo / Demo@123');
    console.log(`Sample ride: ${ride.source.label} to ${ride.destination.label}`);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await Promise.all([User.db?.close()]);
  }
};

seed();
