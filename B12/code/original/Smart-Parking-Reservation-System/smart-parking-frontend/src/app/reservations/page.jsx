'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Car, Clock, Calendar, MapPin, ChevronDown, ChevronUp, X } from 'lucide-react';

const tabs = [
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function statusToTab(status) {
  if (status === 'active') return 'ongoing';
  if (status === 'completed' || status === 'expired') return 'completed';
  return 'cancelled';
}

function getBadge(status, createdAt) {
  if (status === 'active') {
    const isNew = createdAt && (Date.now() - new Date(createdAt).getTime()) < 3600000;
    return isNew
      ? { label: 'New', className: 'status-badge status-badge-new' }
      : { label: 'Active', className: 'status-badge status-badge-active' };
  }
  if (status === 'completed') {
    return { label: 'Completed', className: 'status-badge status-badge-completed' };
  }
  if (status === 'expired') {
    return { label: 'Completed', className: 'status-badge status-badge-completed' };
  }
  return { label: 'Cancelled', className: 'status-badge status-badge-cancelled' };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getDurationHours(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60) * 10) / 10;
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [expandedId, setExpandedId] = useState(null);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations(reservations.filter((r) => r.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation permanently?')) return;
    try {
      await api.delete(`/reservations/${id}/remove`);
      setReservations(reservations.filter((r) => r.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete reservation.');
    }
  };

  const filtered = reservations.filter((r) => statusToTab(r.status) === activeTab);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">My Parkings</h1>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedId(null); }}
            className={`pill-tab whitespace-nowrap ${activeTab === tab.key ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-dark p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700/30 rounded w-3/4" />
                  <div className="h-3 bg-slate-700/30 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-dark p-10 text-center text-[var(--text-secondary)]">
          <Car size={40} className="mx-auto mb-3 opacity-40" />
          {activeTab === 'ongoing' && 'No ongoing reservations.'}
          {activeTab === 'completed' && 'No completed reservations.'}
          {activeTab === 'cancelled' && 'No cancelled reservations.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => {
            const isExpanded = expandedId === res.id;
            const dur = getDurationHours(res.startTime, res.endTime);
            const price = res.totalPrice ? Number(res.totalPrice).toFixed(2) : null;
            const badge = getBadge(res.status, res.createdAt);
            const isCancellable = res.status === 'active' && new Date(res.startTime) > new Date();

            return (
              <div key={res.id} className="card-dark overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : res.id)}
                  className="w-full text-left p-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Car size={22} className="text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {res.slot?.parkingArea?.name || 'Parking Area'}
                        </span>
                        <span className={badge.className}>{badge.label}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {res.slot?.parkingArea?.location || ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {price && (
                        <p className="text-sm font-bold text-[var(--accent-yellow)]">${price}</p>
                      )}
                      <p className="text-[10px] text-[var(--text-secondary)]">{dur}h</p>
                    </div>
                    <div className="text-[var(--text-secondary)] flex-shrink-0">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-3 ml-16">
                    {res.status === 'active' && (
                      <Link
                        href={`/reservations/${res.id}/timer`}
                        className="text-[11px] text-[var(--accent-purple)] hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Timer
                      </Link>
                    )}
                    <Link
                      href={`/reservations/${res.id}`}
                      className="text-[11px] text-[var(--accent-purple)] hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Ticket
                    </Link>
                    {res.status !== 'active' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(res.id); }}
                        className="text-[11px] text-[var(--status-cancelled)] hover:underline font-medium"
                      >
                        Delete
                      </button>
                    )}
                    {isCancellable && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancel(res.id); }}
                        className="text-[11px] text-[var(--status-cancelled)] hover:underline font-medium"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700/30 px-4 py-4 bg-black/20">
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Parking Area</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{res.slot?.parkingArea?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Vehicle Number</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{res.vehicleNumber || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Duration</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{dur} hour{dur !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Parking Slot</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{res.slot?.slotNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Date</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{formatDate(res.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Time</p>
                        <p className="text-[var(--text-primary)] font-medium text-xs mt-0.5">{formatTime(res.startTime)} — {formatTime(res.endTime)}</p>
                      </div>
                    </div>

                    {isCancellable && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        className="btn-primary w-full text-sm"
                      >
                        Cancel Now!
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
