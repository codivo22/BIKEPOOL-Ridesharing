import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import RequireAuth from './components/RequireAuth';
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { OfferRidePage, RideDetailPage, RidesPage } from './pages/RidePages';
import { DashboardPage, NotificationsPage, ProfilePage } from './pages/MemberPages';
import AdminPage from './pages/AdminPage';
import SafetyPage from './pages/SafetyPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import InboxPage from './pages/InboxPage';
import './styles/app.css';

export default function App() {
  return <AuthProvider><BrowserRouter><Routes><Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/rides" element={<RidesPage />} />
    <Route path="/rides/:rideId" element={<RideDetailPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/offer-ride" element={<RequireAuth><OfferRidePage /></RequireAuth>} />
    <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
    <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
    <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
    <Route path="/inbox" element={<RequireAuth><InboxPage /></RequireAuth>} />
    <Route path="/insights" element={<RequireAuth><InsightsPage /></RequireAuth>} />
    <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
    <Route path="/safety" element={<RequireAuth><SafetyPage /></RequireAuth>} />
    <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
    <Route path="*" element={<HomePage />} />
  </Route></Routes></BrowserRouter></AuthProvider>;
}
