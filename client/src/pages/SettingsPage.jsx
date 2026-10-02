import { useState } from 'react';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ paymentPreference: user.paymentPreference || 'cash', upiId: user.upiId || '', messagePreference: user.messagePreference ?? true });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const { data } = await client.patch('/auth/me', form); setUser(data.user); setMessage('Settings saved successfully.'); } catch (error) { setMessage(getErrorMessage(error)); } finally { setBusy(false); }
  };
  return <main className="page-shell narrow"><div className="page-heading"><p className="eyebrow">ACCOUNT SETTINGS</p><h1>Preferences & payments</h1><p>Choose how you prefer to settle ride contributions and receive BikePool updates.</p></div><form className="settings-stack" onSubmit={save}><section className="settings-card"><div className="settings-title"><span>₹</span><div><h2>Payment preference</h2><p>These are preferences only. BikePool does not process payments or store card details.</p></div></div><div className="payment-options">{[['cash', 'Cash', 'Pay the rider in person after the ride.'], ['upi', 'UPI', 'Share your UPI preference with the rider.'], ['wallet', 'Digital wallet', 'Use a wallet you both agree on.'], ['none', 'Decide later', 'Discuss the contribution before the ride.']].map(([value, title, description]) => <label className={`payment-choice ${form.paymentPreference === value ? 'selected' : ''}`} key={value}><input type="radio" name="paymentPreference" value={value} checked={form.paymentPreference === value} onChange={(event) => setForm({ ...form, paymentPreference: event.target.value })} /><span><strong>{title}</strong><small>{description}</small></span></label>)}</div>{form.paymentPreference === 'upi' && <label className="field"><span>UPI ID (optional)</span><input value={form.upiId} placeholder="name@bank" onChange={(event) => setForm({ ...form, upiId: event.target.value })} /></label>}</section><section className="settings-card"><div className="settings-title"><span>✦</span><div><h2>Inbox preferences</h2><p>Control whether booking and ride updates appear in your BikePool Inbox.</p></div></div><label className="toggle-row"><span><strong>Booking and ride notifications</strong><small>Requests, acceptances, cancellations, and ride updates.</small></span><input type="checkbox" checked={form.messagePreference} onChange={(event) => setForm({ ...form, messagePreference: event.target.checked })} /><i /></label></section>{message && <p className={message.startsWith('Settings') ? 'success-box' : 'form-error'}>{message}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></form></main>;
}
