'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { CalendarCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/reservations');
        setReservations(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to fetch reservations', error);
      }
    };
    fetchAll();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setReservations(reservations.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
    } catch (error) {
      alert('Failed to cancel reservation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations(reservations.filter((r) => r.id !== id));
    } catch (error) {
      alert('Failed to delete reservation');
    }
  };

  const statusBadge = (status) => {
    if (status === 'active') return <span className="pill-critical">Active</span>;
    if (status === 'completed') return <span className="pill-success">Completed</span>;
    if (status === 'cancelled') return <span className="pill-warning">Cancelled</span>;
    if (status === 'expired') return <span className="pill-secondary">Expired</span>;
    return <span className="pill-secondary">{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">Manage Reservations</h1>

      <div className="space-y-4">
        {reservations.length === 0 && (
          <div className="card-dark p-6 text-center text-[var(--text-secondary)]">No reservations found.</div>
        )}

        {reservations.map((res) => (
          <div key={res.id} className="card-dark overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === res.id ? null : res.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple)]/15 flex items-center justify-center flex-shrink-0">
                  <CalendarCheck size={20} className="text-[var(--accent-purple)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {res.areaName || `Area #${res.areaId}`} — Slot {res.slotNumber || `#${res.slotId}`}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {res.user?.fullName || res.user?.email || `User #${res.userId}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                {statusBadge(res.status)}
                {expanded === res.id ? <ChevronUp size={18} className="text-[var(--text-secondary)]" /> : <ChevronDown size={18} className="text-[var(--text-secondary)]" />}
              </div>
            </button>

            {expanded === res.id && (
              <div className="px-5 pb-5 pt-0 border-t border-slate-700/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Start Time</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.startTime ? new Date(res.startTime).toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">End Time</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.endTime ? new Date(res.endTime).toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Vehicle</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.vehicleNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Type</p>
                    <p className="text-sm text-[var(--text-primary)] capitalize">{res.vehicleType || 'standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Phone</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Duration</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.duration ? `${res.duration}h` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Total</p>
                    <p className="text-sm font-semibold text-[var(--accent-yellow)]">${Number(res.totalCost || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Booked</p>
                    <p className="text-sm text-[var(--text-primary)]">{res.createdAt ? new Date(res.createdAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {res.status === 'active' && (
                    <button onClick={() => handleCancel(res.id)} className="px-4 py-1.5 rounded-full text-xs font-medium border border-[var(--status-cancelled)]/40 text-[var(--status-cancelled)] hover:bg-[var(--status-cancelled)]/10 transition">
                      Cancel
                    </button>
                  )}
                  <button onClick={() => handleDelete(res.id)} className="px-4 py-1.5 rounded-full text-xs font-medium border border-slate-700/30 text-[var(--text-secondary)] hover:text-[var(--status-cancelled)] hover:border-[var(--status-cancelled)]/40 transition">
                    <Trash2 size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
