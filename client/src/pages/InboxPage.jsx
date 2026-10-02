import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';

export default function InboxPage() {
  const [notifications, setNotifications] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const load = () => Promise.all([client.get('/notifications'), client.get('/bookings/received'), client.get('/bookings/mine')]).then(([notices, receivedBookings, sentBookings]) => { setNotifications(notices.data.notifications); setReceived(receivedBookings.data.bookings); setSent(sentBookings.data.bookings); });
  useEffect(() => { load(); }, []);
  const markAllRead = async () => { await client.patch('/notifications/read-all'); load(); };
  const bookingMessages = [...received.filter((booking) => booking.message).map((booking) => ({ ...booking, direction: 'received' })), ...sent.filter((booking) => booking.message).map((booking) => ({ ...booking, direction: 'sent' }))].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  return <main className="page-shell narrow"><div className="page-heading inline-heading"><div><p className="eyebrow">TRIP INBOX</p><h1>Messages & updates</h1><p>Booking messages, decisions, cancellations, and ride updates in one place.</p></div><button className="text-button" onClick={markAllRead}>Mark updates read</button></div><section className="inbox-section"><div className="section-heading"><h2>Booking messages</h2><span>{bookingMessages.length} total</span></div><div className="table-card">{bookingMessages.length ? bookingMessages.map((booking) => { const person = booking.direction === 'received' ? booking.passenger : booking.ride.owner; return <article className="message-row" key={booking._id}><Avatar user={person} size="sm" /><div><strong>{person.name}</strong><p>{booking.ride.source.label} → {booking.ride.destination.label}</p><blockquote>“{booking.message}”</blockquote></div><StatusBadge status={booking.status} /></article>; }) : <p className="empty-inline">No booking messages yet. Add a note when requesting a ride to start a trip conversation.</p>}</div></section><section className="inbox-section"><div className="section-heading"><h2>Ride updates</h2><span>{notifications.length} total</span></div><div className="table-card">{notifications.length ? notifications.map((notice) => <article className={`notice ${notice.isRead ? '' : 'unread'}`} key={notice._id}><div><h3>{notice.title}</h3><p>{notice.message}</p><small>{new Date(notice.createdAt).toLocaleString('en-IN')}</small></div>{notice.relatedRide && <Link className="text-link" to={`/rides/${notice.relatedRide}`}>View ride</Link>}</article>) : <p className="empty-inline">No updates yet.</p>}</div></section></main>;
}
