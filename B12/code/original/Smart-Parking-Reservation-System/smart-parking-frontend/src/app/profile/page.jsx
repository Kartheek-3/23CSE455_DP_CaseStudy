'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    defaultVehicleNumber: user?.defaultVehicleNumber || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.patch('/auth/profile', form);
      login(res.data.user || res.data, res.data.token);
      setMessage('Profile updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '?';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-yellow)] flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{user?.fullName || 'Your Profile'}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
          <span className={`mt-2 text-xs font-medium px-3 py-0.5 rounded-full ${user?.role === 'admin' ? 'pill-warning' : 'pill-primary'}`}>
            {user?.role}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="card-dark p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Default Vehicle Number</label>
            <input
              type="text"
              name="defaultVehicleNumber"
              value={form.defaultVehicleNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
              placeholder="e.g., ABC-1234"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-secondary)] text-sm cursor-not-allowed"
            />
          </div>

          {message && (
            <div className="text-sm text-center text-[var(--status-available)] bg-[var(--status-available)]/10 py-2 rounded-full">
              {message}
            </div>
          )}
          {error && (
            <div className="text-sm text-center text-[var(--status-cancelled)] bg-[var(--status-cancelled)]/10 py-2 rounded-full">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm rounded-full">
            {loading ? 'Saving...' : (
              <><Save size={18} className="mr-1.5 inline" /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
