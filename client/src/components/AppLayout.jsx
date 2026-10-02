import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [welcomeName, setWelcomeName] = useState('');
  const logout = () => { signOut(); setMenuOpen(false); navigate('/'); };

  useEffect(() => {
    if (!user) { setUnreadCount(0); return undefined; }
    const loadNotifications = () => client.get('/notifications').then(({ data }) => setUnreadCount(data.unreadCount)).catch(() => {});
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    const name = sessionStorage.getItem('bikepool_welcome_name');
    if (!name) return undefined;
    sessionStorage.removeItem('bikepool_welcome_name');
    setWelcomeName(name);
    const timer = setTimeout(() => setWelcomeName(''), 4200);
    return () => clearTimeout(timer);
  }, [user]);

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="app-header">
      <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}><span>◉</span> BikePool</NavLink>
      <button className="menu-button" type="button" aria-label="Toggle navigation menu" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><i /><i /><i /></button>
      <nav className={`app-nav ${menuOpen ? 'is-open' : ''}`} id="primary-navigation" aria-label="Primary navigation">
        <NavLink to="/rides" onClick={() => setMenuOpen(false)}>Find rides</NavLink>
        <NavLink to="/safety" onClick={() => setMenuOpen(false)}>Safety</NavLink>
        {user && <NavLink to="/offer-ride" onClick={() => setMenuOpen(false)}>Offer a ride</NavLink>}
        {user && <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
        {user && <NavLink to="/insights" onClick={() => setMenuOpen(false)}>Insights</NavLink>}
        {user && <NavLink to="/inbox" onClick={() => setMenuOpen(false)}>Inbox</NavLink>}
        {user && <NavLink to="/settings" onClick={() => setMenuOpen(false)}>Settings</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
      </nav>
      <div className="account-area">
        {user ? <><NavLink className="notification-link" to="/inbox" aria-label={`Inbox${unreadCount ? `, ${unreadCount} unread` : ''}`}><span aria-hidden="true">♢</span>{unreadCount > 0 && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}</NavLink><NavLink className="profile-link" to="/profile" title="Open your profile"><Avatar user={user} size="sm" /><span>{user.name.split(' ')[0]}</span></NavLink><button className="text-button" type="button" onClick={logout}>Log out</button></> : <><NavLink className="text-button" to="/login">Log in</NavLink><NavLink className="button button-primary" to="/register">Get started</NavLink></>}
      </div>
    </header>
    {welcomeName && <div className="welcome-toast" role="status"><span>✓</span> Hello, {welcomeName}! Welcome back to BikePool.</div>}
    <div id="main-content" tabIndex="-1"><Outlet /></div>
    <footer className="footer"><strong>BikePool</strong><span>Share the Ride, Share the Cost.</span><span>College project prototype - always follow local road-safety rules.</span></footer>
  </>;
}
