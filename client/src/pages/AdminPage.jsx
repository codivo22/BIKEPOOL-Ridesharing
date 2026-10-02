import { useEffect, useState } from 'react';
import client, { getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [dashboard, userList, reportList, reviewList] = await Promise.all([
        client.get('/admin/dashboard'), client.get('/admin/users'), client.get('/admin/reports'), client.get('/admin/reviews')
      ]);
      setStats(dashboard.data.stats);
      setUsers(userList.data.users);
      setReports(reportList.data.reports);
      setReviews(reviewList.data.reviews);
    } catch (error) { setMessage(getErrorMessage(error)); }
  };

  useEffect(() => { load(); }, []);
  const updateUser = async (userId, status) => { await client.patch(`/admin/users/${userId}/status`, { status }); load(); };
  const updateReport = async (reportId, status) => { await client.patch(`/admin/reports/${reportId}`, { status, adminNote: `Marked ${status} by admin.` }); load(); };
  const removeReview = async (reviewId) => { if (window.confirm('Remove this review from the platform?')) { await client.delete(`/admin/reviews/${reviewId}`); load(); } };

  return <main className="page-shell">
    <div className="page-heading"><p className="eyebrow">ADMINISTRATOR AREA</p><h1>Platform overview</h1><p>Manage members, safety reports, reviews, and BikePool activity.</p></div>
    {message && <p className="form-error">{message}</p>}
    <div className="stat-grid">{stats ? [['Members', stats.users], ['Published rides', stats.rides], ['Bookings', stats.bookings], ['Open reports', stats.openReports], ['Completed rides', stats.completedRides]].map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>) : <p>Loading statistics…</p>}</div>
    <section className="dashboard-section"><div className="section-heading"><h2>Safety reports</h2><span>{reports.length} total</span></div><div className="table-card">{reports.length ? reports.map((report) => <div className="admin-row" key={report._id}><div><strong>{report.reason.replace('_', ' ')}</strong><p>From {report.reporter?.name} {report.reportedUser && `about ${report.reportedUser.name}`}</p><small>{report.description}</small></div><StatusBadge status={report.status} />{['open', 'reviewing'].includes(report.status) && <div className="action-pair"><button className="approve-button" onClick={() => updateReport(report._id, 'resolved')}>Resolve</button><button className="text-button" onClick={() => updateReport(report._id, 'dismissed')}>Dismiss</button></div>}</div>) : <p className="empty-inline">No reports have been submitted.</p>}</div></section>
    <section className="dashboard-section"><div className="section-heading"><h2>Reviews</h2><span>{reviews.length} total</span></div><div className="table-card">{reviews.length ? reviews.map((review) => <div className="admin-row" key={review._id}><div><strong>★ {review.rating} - {review.reviewer?.name} on {review.reviewedUser?.name}</strong><p>{review.ride?.source?.label} → {review.ride?.destination?.label}</p><small>{review.comment || 'No written comment.'}</small></div><button className="danger-button" onClick={() => removeReview(review._id)}>Remove</button></div>) : <p className="empty-inline">No reviews have been submitted.</p>}</div></section>
    <section className="dashboard-section"><div className="section-heading"><h2>Members</h2><span>{users.length} shown</span></div><div className="table-card">{users.map((user) => <div className="admin-row" key={user._id}><div><strong>{user.name}</strong><p>{user.email} · {user.role}</p><small>{user.collegeOrOrganization || 'No organization added'}</small></div><StatusBadge status={user.status} />{user.role !== 'admin' && <button className={user.status === 'active' ? 'danger-button' : 'approve-button'} onClick={() => updateUser(user._id, user.status === 'active' ? 'suspended' : 'active')}>{user.status === 'active' ? 'Suspend' : 'Activate'}</button>}</div>)}</div></section>
  </main>;
}
