import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';

const dateFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function RideCard({ ride, showStatus = false }) {
  return <article className="ride-card">
    <div className="ride-card-top"><span>{dateFormatter.format(new Date(ride.departureAt))}</span>{showStatus ? <StatusBadge status={ride.status} /> : <span className="seat-pill">{ride.availableSeats} seat{ride.availableSeats === 1 ? '' : 's'} left</span>}</div>
    <div className="ride-route"><div><i className="route-dot origin" /><span>{ride.source.label}</span></div><div className="route-stem" /><div><i className="route-dot destination" /><span>{ride.destination.label}</span></div></div>
    <div className="ride-card-bottom">
      <div className="rider-mini">{ride.owner && <Avatar user={ride.owner} size="sm" />}<span>{ride.owner?.name || 'You'}<small>{ride.owner?.averageRating ? `★ ${ride.owner.averageRating.toFixed(1)}` : 'New rider'}</small></span></div>
      <strong>₹{ride.contribution}</strong><Link className="text-link" to={`/rides/${ride._id}`}>View</Link>
    </div>
  </article>;
}
