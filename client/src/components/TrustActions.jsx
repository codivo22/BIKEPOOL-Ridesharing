import { useState } from 'react';
import client, { getErrorMessage } from '../api/client';

export function ReportRide({ reportedUser, ride }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ reason: 'safety', description: '' });
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      await client.post('/reports', { ...form, reportedUser, ride });
      setMessage('Thanks - your report was sent to the BikePool admin.');
    } catch (error) { setMessage(getErrorMessage(error)); }
  };

  if (!open) return <button className="report-link" type="button" onClick={() => setOpen(true)}>Report a concern</button>;
  return <div className="trust-box">
    {message ? <p className="success-box">{message}</p> : <form className="form-stack" onSubmit={submit}>
      <label className="field"><span>Reason</span><select value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}><option value="safety">Safety concern</option><option value="behaviour">Inappropriate behaviour</option><option value="fake_profile">Fake profile</option><option value="spam">Spam</option><option value="other">Other</option></select></label>
      <label className="field"><span>What happened?</span><textarea required maxLength="600" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <button className="button button-secondary">Send report</button>
    </form>}
  </div>;
}

export function ReviewAction({ booking, onComplete }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      await client.post('/reviews', { bookingId: booking._id, rating: Number(rating), comment });
      setMessage('Review posted. Thank you!');
      onComplete?.();
    } catch (error) { setMessage(getErrorMessage(error)); }
  };

  if (!open) return <button className="text-button review-trigger" type="button" onClick={() => setOpen(true)}>Rate ride</button>;
  return <div className="inline-review">
    {message ? <small>{message}</small> : <form onSubmit={submit}><select aria-label="Rating" value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((score) => <option value={score} key={score}>{score} star{score === 1 ? '' : 's'}</option>)}</select><input required maxLength="400" value={comment} placeholder="Write a short review" onChange={(event) => setComment(event.target.value)} /><button className="approve-button">Post</button></form>}
  </div>;
}
