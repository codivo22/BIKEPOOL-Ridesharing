import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';

export default function InsightsPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    Promise.all([client.get('/rides/mine'), client.get('/bookings/mine'), client.get('/bookings/received')])
      .then(([rideResponse, bookingResponse, receivedResponse]) => {
        setRides(rideResponse.data.rides);
        setBookings(bookingResponse.data.bookings);
        setReceived(receivedResponse.data.bookings);
      }).catch(() => {});
  }, []);

  const summary = useMemo(() => ({
    accepted: [...bookings, ...received].filter((booking) => booking.status === 'accepted').length,
    cancelled: [...bookings, ...received].filter((booking) => booking.status === 'cancelled').length,
    completed: [...bookings, ...received].filter((booking) => booking.status === 'completed').length,
    offered: rides.length
  }), [bookings, received, rides]);
  const recent = [...rides.map((ride) => ({ type: 'Ride offered', date: ride.createdAt, status: ride.status, title: `${ride.source.label} → ${ride.destination.label}` })), ...bookings.map((booking) => ({ type: 'Seat request', date: booking.createdAt, status: booking.status, title: `${booking.ride.source.label} → ${booking.ride.destination.label}` }))].sort((first, second) => new Date(second.date) - new Date(first.date)).slice(0, 6);

  return <main className="page-shell"><div className="insights-hero"><Avatar user={user} size="lg" /><div><p className="eyebrow">YOUR PROFILE</p><h1>{user.name}</h1><p>{user.collegeOrOrganization || 'BikePool member'} · {user.averageRating ? `★ ${user.averageRating.toFixed(1)} rating` : 'New community member'}</p></div><Link className="button button-secondary" to="/profile">Edit profile</Link></div><section className="insights-grid"><article><span>Rides offered</span><strong>{summary.offered}</strong><small>Routes you published</small></article><article><span>Accepted rides</span><strong>{summary.accepted}</strong><small>Confirmed ride connections</small></article><article><span>Cancelled</span><strong>{summary.cancelled}</strong><small>Bookings or rides cancelled</small></article><article><span>Completed</span><strong>{summary.completed}</strong><small>Ready for ratings and reviews</small></article></section><section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">ACTIVITY TIMELINE</p><h2>Recent rides</h2></div><Link className="text-link" to="/dashboard">Open dashboard →</Link></div><div className="table-card">{recent.length ? recent.map((item, index) => <article className="recent-row" key={`${item.title}-${index}`}><div className="recent-icon">{item.type === 'Ride offered' ? '↗' : '◎'}</div><div><strong>{item.title}</strong><p>{item.type} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><StatusBadge status={item.status} /></article>) : <p className="empty-inline">Your recent ride activity will appear here. <Link to="/rides">Find a ride</Link> or <Link to="/offer-ride">offer one</Link>.</p>}</div></section></main>;
}
