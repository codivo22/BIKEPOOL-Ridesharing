import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import LocationInput from '../components/LocationInput';
import MapPreview from '../components/MapPreview';
import RideCard from '../components/RideCard';
import StatusBadge from '../components/StatusBadge';
import { ReportRide } from '../components/TrustActions';

const emptySearch = { source: '', destination: '', date: '' };

export function RidesPage() {
  const [params, setParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('soonest');
  const [form, setForm] = useState({ source: params.get('source') || '', destination: params.get('destination') || '', date: params.get('date') || '' });
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('bikepool_saved_searches') || '[]'));

  const load = async (search = params) => {
    setLoading(true);
    try { const { data } = await client.get(`/rides?${search.toString()}`); setRides(data.rides); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [params]);
  const submit = (event) => { event.preventDefault(); const next = new URLSearchParams(); Object.entries(form).forEach(([key, value]) => value && next.set(key, value)); setParams(next); };
  const saveSearch = () => {
    if (!form.source && !form.destination && !form.date) return;
    const item = { ...form, id: `${form.source}-${form.destination}-${form.date}` };
    const next = [item, ...saved.filter((search) => search.id !== item.id)].slice(0, 3);
    localStorage.setItem('bikepool_saved_searches', JSON.stringify(next)); setSaved(next);
  };
  const applySearch = (search) => { setForm(search); const next = new URLSearchParams(); Object.entries(search).forEach(([key, value]) => key !== 'id' && value && next.set(key, value)); setParams(next); };
  const sortedRides = [...rides].sort((first, second) => sort === 'lowest' ? first.contribution - second.contribution : new Date(first.departureAt) - new Date(second.departureAt));

  return <main className="page-shell">
    <div className="page-heading"><p className="eyebrow">DISCOVER RIDES</p><h1>Find your next ride.</h1><p>Search local routes, compare contributions, and request the seat that fits your journey.</p></div>
    <form className="filter-bar elevated-filter" onSubmit={submit}><input aria-label="Source" placeholder="From" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} /><input aria-label="Destination" placeholder="To" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} /><input aria-label="Date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><button className="button button-primary">Search</button><button className="button button-secondary save-search" type="button" onClick={saveSearch}>Save</button></form>
    {saved.length > 0 && <div className="saved-searches"><span>Saved searches</span>{saved.map((search) => <button type="button" key={search.id} onClick={() => applySearch(search)}>{search.source || 'Anywhere'} <b>→</b> {search.destination || 'Anywhere'}</button>)}</div>}
    <div className="results-heading"><span>{loading ? 'Searching…' : `${rides.length} ride${rides.length === 1 ? '' : 's'} found`}</span><label className="sort-control">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="soonest">Soonest departure</option><option value="lowest">Lowest contribution</option></select></label></div>
    <div className="ride-grid">{!loading && sortedRides.map((ride) => <RideCard key={ride._id} ride={ride} />)}{!loading && !rides.length && <div className="empty-card"><span className="empty-icon">⌁</span><h3>No matching rides yet</h3><p>Try a nearby landmark, another date, or become the first person to offer this route.</p><Link className="button button-primary" to="/offer-ride">Offer a ride</Link></div>}</div>
  </main>;
}

export function RideDetailPage() {
  const { rideId } = useParams(); const { user } = useAuth(); const navigate = useNavigate();
  const [ride, setRide] = useState(null); const [booking, setBooking] = useState({ pickupPoint: '', message: '' }); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { client.get(`/rides/${rideId}`).then(({ data }) => setRide(data.ride)).catch(() => setError('Ride not found.')); }, [rideId]);
  const requestSeat = async (event) => { event.preventDefault(); if (!user) { navigate('/login', { state: { from: `/rides/${rideId}` } }); return; } setBusy(true); setError(''); try { await client.post('/bookings', { ...booking, rideId }); setMessage('Ride request sent! The rider will be notified.'); } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); } };
  if (!ride) return <main className="page-shell"><div className="empty-card">{error || 'Loading ride…'}</div></main>;
  const mine = user?._id === ride.owner?._id;
  return <main className="page-shell"><Link className="back-link" to="/rides">← Back to rides</Link><div className="detail-grid"><section className="detail-card"><div className="detail-meta"><span>{new Date(ride.departureAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span><StatusBadge status={ride.status} /></div><h1>{ride.source.label}<span className="route-arrow">→</span>{ride.destination.label}</h1><MapPreview source={ride.source} destination={ride.destination} /><div className="detail-stats"><div><span>Contribution</span><strong>₹{ride.contribution}</strong></div><div><span>Seats available</span><strong>{ride.availableSeats} of {ride.totalSeats}</strong></div><div><span>Bike</span><strong>{ride.bike?.model}</strong></div></div>{ride.notes && <p className="ride-notes">“{ride.notes}”</p>}</section><aside className="request-card"><div className="rider-profile"><Avatar user={ride.owner} size="lg" /><div><span>Offered by</span><h3>{ride.owner.name}</h3><p>{ride.owner.averageRating ? `★ ${ride.owner.averageRating.toFixed(1)} from ${ride.owner.reviewCount} review(s)` : 'New BikePool member'}</p></div></div>{mine ? <Link className="button button-primary full-width" to="/dashboard">Manage this ride</Link> : message ? <p className="success-box">{message}</p> : <form className="form-stack" onSubmit={requestSeat}><label className="field"><span>Pickup point (optional)</span><input value={booking.pickupPoint} onChange={(event) => setBooking({ ...booking, pickupPoint: event.target.value })} placeholder="e.g. Library gate" /></label><label className="field"><span>Message to rider (optional)</span><textarea value={booking.message} onChange={(event) => setBooking({ ...booking, message: event.target.value })} placeholder="Introduce yourself or share a note" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary full-width" disabled={busy || ride.availableSeats < 1 || ride.status !== 'published'}>{busy ? 'Sending…' : ride.availableSeats < 1 ? 'No seats available' : 'Request a seat'}</button></form>}{user && !mine && <ReportRide reportedUser={ride.owner._id} ride={ride._id} />}</aside></div></main>;
}

export function OfferRidePage() {
  const navigate = useNavigate(); const [bikes, setBikes] = useState([]); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ bikeId: '', source: { label: '', coordinates: [] }, destination: { label: '', coordinates: [] }, departureAt: '', contribution: '', notes: '' });
  useEffect(() => { client.get('/bikes').then(({ data }) => { setBikes(data.bikes); if (data.bikes[0]) setForm((current) => ({ ...current, bikeId: data.bikes[0]._id })); }); }, []);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const { data } = await client.post('/rides', { ...form, contribution: Number(form.contribution) }); setSuccess('Ride published successfully.'); setTimeout(() => navigate(`/rides/${data.ride._id}`), 700); } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); } };
  return <main className="page-shell"><div className="page-heading"><p className="eyebrow">OFFER A RIDE</p><h1>Got an empty seat?</h1><p>Publish your route and let a fellow commuter join you.</p></div>{!bikes.length ? <section className="empty-card"><h3>Add your bike first</h3><p>Your bike details are needed to publish a ride.</p><Link className="button button-primary" to="/profile">Add a bike</Link></section> : <form className="offer-layout" onSubmit={submit}><section className="form-card"><div className="form-row"><label className="field"><span>Bike</span><select required value={form.bikeId} onChange={(event) => setForm({ ...form, bikeId: event.target.value })}>{bikes.map((bike) => <option value={bike._id} key={bike._id}>{bike.model} - {bike.registrationNumber}</option>)}</select></label><label className="field"><span>Contribution (₹)</span><input type="number" min="0" max="5000" required value={form.contribution} onChange={(event) => setForm({ ...form, contribution: event.target.value })} /></label></div><LocationInput label="Source" value={form.source} required onChange={(source) => setForm({ ...form, source })} /><LocationInput label="Destination" value={form.destination} required onChange={(destination) => setForm({ ...form, destination })} /><label className="field"><span>Departure date and time</span><input type="datetime-local" required value={form.departureAt} onChange={(event) => setForm({ ...form, departureAt: event.target.value })} /></label><label className="field"><span>Additional note</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="e.g. Helmet available; please arrive five minutes early." /></label>{error && <p className="form-error">{error}</p>}{success && <p className="success-box">{success}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Publishing…' : 'Publish ride'}</button></section><aside className="map-card"><h3>Route preview</h3><MapPreview source={form.source} destination={form.destination} /><p>For accurate route pins, select one of the suggested locations.</p></aside></form>}</main>;
}
