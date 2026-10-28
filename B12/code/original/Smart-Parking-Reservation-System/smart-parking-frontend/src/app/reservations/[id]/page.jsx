'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Car, MapPin, ExternalLink } from 'lucide-react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getDurationHours(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60) * 10) / 10;
}

export default function ParkingTicketPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await api.get('/reservations/my');
        const found = res.data.find((r) => String(r.id) === String(id));
        setReservation(found || null);
      } catch (error) {
        console.error('Failed to fetch reservation', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <div className="card-dark p-6 animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/30 rounded w-24" />
          <div className="h-48 bg-slate-700/30 rounded-xl w-48 mx-auto" />
          <div className="h-4 bg-slate-700/30 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <button onClick={() => router.back()} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-6">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
        <div className="card-dark p-10 text-center text-[var(--text-secondary)]">
          <Car size={40} className="mx-auto mb-3 opacity-40" />
          Reservation not found.
        </div>
      </div>
    );
  }

  const dur = getDurationHours(reservation.startTime, reservation.endTime);
  const totalPrice = reservation.totalPrice ? Number(reservation.totalPrice).toFixed(2) : null;
  const qrData = JSON.stringify({
    id: reservation.id,
    slot: reservation.slot?.slotNumber,
    area: reservation.slot?.parkingArea?.name,
    vehicle: reservation.vehicleNumber,
    start: reservation.startTime,
    end: reservation.endTime,
  });

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    reservation.slot?.parkingArea?.name || 'parking'
  )}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
      <button onClick={() => router.back()} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-4">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <div className="card-dark p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-hover)] flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">SmartPark</span>
          </div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Parking Ticket</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Scan this QR on the scanner machine</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG value={qrData} size={180} level="M" />
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] rounded-xl p-4 space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Name</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{user?.fullName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Vehicle Number</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.vehicleNumber || '—'}</span>
          </div>
          <div className="border-t border-slate-700/20 my-1" />
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Parking Area</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.slot?.parkingArea?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Parking Slot</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.slot?.slotNumber || '—'}</span>
          </div>
          <div className="border-t border-slate-700/20 my-1" />
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Duration</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{dur} hour{dur !== 1 ? 's' : ''}</span>
          </div>
          {totalPrice && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Price</span>
              <span className="text-[var(--accent-yellow)] font-bold text-right">${totalPrice}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Time</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{formatTime(reservation.startTime)} — {formatTime(reservation.endTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Date</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{formatDate(reservation.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Phone Number</span>
            <span className="text-[var(--text-primary)] font-medium text-right">{reservation.phoneNumber || '—'}</span>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full text-sm inline-flex items-center justify-center space-x-2"
        >
          <MapPin size={16} />
          <span>Start Navigation</span>
          <ExternalLink size={14} />
        </a>

        <p className="text-[10px] text-[var(--text-secondary)] text-center mt-4">
          Reservation #{reservation.id} · {reservation.status}
        </p>
      </div>
    </div>
  );
}
