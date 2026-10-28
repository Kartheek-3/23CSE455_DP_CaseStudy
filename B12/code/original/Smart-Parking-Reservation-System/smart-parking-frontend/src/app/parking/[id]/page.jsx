'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Car, ChevronLeft, ChevronRight, CheckCircle, DollarSign } from 'lucide-react';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const sections = ['A', 'B', 'C', 'D'];

const stepLabels = ['Select Slot', 'Duration & Type', 'Confirm'];

export default function ParkingAreaDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [area, setArea] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 10 * 60 * 1000);
  const [startTime] = useState(defaultStart.toISOString());
  const [duration, setDuration] = useState(60);
  const [vehicleType, setVehicleType] = useState('four_wheeler');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.defaultVehicleNumber || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [activeFloor, setActiveFloor] = useState('G');
  const [activeSection, setActiveSection] = useState('A');

  const [step, setStep] = useState(1);

  const endTime = useMemo(() => {
    const s = new Date(startTime);
    return new Date(s.getTime() + duration * 60 * 1000);
  }, [startTime, duration]);

  const slotPrice = selectedSlot
    ? parseFloat(selectedSlot.pricePerHour || area?.pricePerHour || 5)
    : 0;
  const total = slotPrice * (duration / 60);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [areaRes, slotsRes] = await Promise.all([
          api.get(`/parking`),
          api.get(`/slots?parkingAreaId=${id}`),
        ]);
        const found = areaRes.data.data.find((a) => String(a.id) === String(id));
        setArea(found || null);
        const sorted = slotsRes.data.sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
        setAllSlots(sorted);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!selectedSlot || step !== 1) return;
    const checkAvail = async () => {
      try {
        const s = new Date(startTime).toISOString();
        const e = endTime.toISOString();
        const res = await api.get(`/slots/available/${id}?startTime=${s}&endTime=${e}`);
        const availIds = new Set(res.data.map((sl) => sl.id));
        setAllSlots((prev) =>
          prev.map((sl) => ({ ...sl, status: availIds.has(sl.id) ? 'available' : 'occupied' }))
        );
      } catch (error) {
        console.error('Failed to check availability', error);
      }
    };
    checkAvail();
  }, [startTime, endTime, id, selectedSlot, step]);

  const floorMap = useMemo(() => {
    const map = {};
    for (const slot of allSlots) {
      const f = slot.floor !== undefined && slot.floor !== null ? String(slot.floor) : 'G';
      if (!map[f]) map[f] = [];
      map[f].push(slot);
    }
    return map;
  }, [allSlots]);

  const floors = useMemo(() => Object.keys(floorMap).sort(), [floorMap]);

  const safeFloor = floors.includes(activeFloor) ? activeFloor : (floors[0] || 'G');
  const currentFloorSlots = floorMap[safeFloor] || [];

  const sectionMap = useMemo(() => {
    const map = {};
    const floorSlots = floorMap[safeFloor] || [];
    for (const slot of floorSlots) {
      const prefix = slot.slotNumber.charAt(0).toUpperCase();
      const sec = sections.includes(prefix) ? prefix : 'A';
      if (!map[sec]) map[sec] = [];
      map[sec].push(slot);
    }
    return map;
  }, [floorMap, safeFloor]);

  const sectionsAvail = useMemo(() => Object.keys(sectionMap).sort(), [sectionMap]);

  const safeSection = sectionsAvail.includes(activeSection) ? activeSection : (sectionsAvail[0] || 'A');
  const currentSectionSlots = sectionMap[safeSection] || [];

  const sectionIndex = sectionsAvail.indexOf(safeSection);

  const handleCheckout = async () => {
    if (!vehicleNumber.trim()) return;
    try {
      setBooking(true);
      const s = new Date(startTime).toISOString();
      const e = endTime.toISOString();
      const payload = {
        slotId: selectedSlot.id,
        startTime: s,
        endTime: e,
        vehicleNumber: vehicleNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        vehicleType,
      };
      const res = await api.post('/reservations', payload);
      setCreatedReservation(res.data);
      setShowConfirmation(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setBooking(false);
    }
  };

  if (loading && !area) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-700/30 rounded w-24" />
          <div className="h-8 bg-slate-700/30 rounded w-64" />
          <div className="h-40 bg-slate-700/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <button onClick={() => router.back()} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-6">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
        <div className="card-dark p-10 text-center text-[var(--text-secondary)]">
          <Car size={40} className="mx-auto mb-3 opacity-40" />
          Parking area not found.
        </div>
      </div>
    );
  }

  if (showConfirmation && createdReservation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="card-dark p-6 sm:p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--status-active)]/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-[var(--status-active)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Your parking slot has been reserved.</p>

          <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Name</span>
              <span className="text-[var(--text-primary)] font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Vehicle</span>
              <span className="text-[var(--text-primary)] font-medium">{vehicleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Area</span>
              <span className="text-[var(--text-primary)] font-medium">{area.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Slot</span>
              <span className="text-[var(--text-primary)] font-medium">{selectedSlot?.slotNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Duration</span>
              <span className="text-[var(--text-primary)] font-medium">{duration < 60 ? `${duration} min` : `${duration / 60} hour${duration / 60 > 1 ? 's' : ''}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Time</span>
              <span className="text-[var(--text-primary)] font-medium">{formatTime(startTime)} — {formatTime(endTime.toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Date</span>
              <span className="text-[var(--text-primary)] font-medium">{formatDate(startTime)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-700/30">
              <span className="text-[var(--text-secondary)]">Total</span>
              <span className="text-[var(--accent-yellow)] font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={() => router.push('/reservations')} className="btn-primary w-full text-sm">
            View My Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <button onClick={() => step === 1 ? router.back() : setStep(step - 1)} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-4">
        <ArrowLeft size={18} className="mr-2" /> {step === 1 ? 'Back to Locations' : 'Back'}
      </button>

      <div className="flex items-center space-x-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
              s === step ? 'bg-[var(--accent-purple)] text-white' :
              s < step ? 'bg-[var(--status-active)] text-white' :
              'bg-slate-700/30 text-[var(--text-secondary)]'
            }`}>
              {s < step ? <CheckCircle size={14} /> : s}
            </div>
            {s < 3 && <div className={`w-8 sm:w-12 h-0.5 mx-1 transition ${s < step ? 'bg-[var(--status-active)]' : 'bg-slate-700/30'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{area.name}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{area.location}</p>
          </div>

          {floors.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {floors.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFloor(f)}
                  className={`pill-tab whitespace-nowrap ${safeFloor === f ? 'pill-tab-active' : 'pill-tab-inactive'}`}
                >
                  {f === 'G' ? 'G Floor' : `${f}${f === '1' ? 'st' : f === '2' ? 'nd' : f === '3' ? 'rd' : 'th'} Floor`}
                </button>
              ))}
            </div>
          )}

          {sectionsAvail.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const idx = sectionsAvail.indexOf(activeSection);
                  if (idx > 0) setActiveSection(sectionsAvail[idx - 1]);
                }}
                disabled={sectionIndex <= 0}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-[var(--text-primary)]">Section {activeSection}</span>
              <button
                onClick={() => {
                  const idx = sectionsAvail.indexOf(activeSection);
                  if (idx < sectionsAvail.length - 1) setActiveSection(sectionsAvail[idx + 1]);
                }}
                disabled={sectionIndex >= sectionsAvail.length - 1}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="card-dark p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {currentSectionSlots.map((slot) => {
                const isAvail = slot.status === 'available' || slot.status === 'AVAILABLE';
                const isSelected = selectedSlot?.id === slot.id;
                const sp = parseFloat(slot.pricePerHour || area.pricePerHour || 0);
                return (
                  <button
                    key={slot.id}
                    onClick={() => { if (isAvail) setSelectedSlot(slot); }}
                    disabled={!isAvail}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10 ring-1 ring-[var(--accent-yellow)]'
                        : isAvail
                          ? 'border-slate-700/30 bg-[var(--bg-primary)] hover:border-[var(--accent-purple)]/50 cursor-pointer'
                          : 'border-slate-700/20 bg-slate-800/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Car size={22} className={`${isAvail ? 'text-[var(--text-secondary)]' : 'text-slate-600'}`} />
                    <span className={`text-[10px] font-bold mt-1 ${isAvail ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                      {slot.slotNumber}
                    </span>
                    {sp > 0 && (
                      <span className="text-[9px] text-[var(--accent-yellow)] font-semibold mt-0.5">${sp.toFixed(2)}/h</span>
                    )}
                    {isSelected && (
                      <span className="text-[9px] font-semibold text-[var(--accent-yellow)] mt-0.5">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedSlot}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedSlot ? `Next — ${selectedSlot.slotNumber}` : 'Select a Slot'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 max-w-lg mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Duration & Vehicle</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {area.name} · Slot {selectedSlot?.slotNumber} · ${slotPrice.toFixed(2)}/hour
            </p>
          </div>

          <div className="card-dark p-5">
            <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">Vehicle Type</label>
            <div className="flex space-x-3">
              {['two_wheeler', 'four_wheeler'].map((type) => (
                <button
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition border ${
                    vehicleType === type
                      ? 'bg-[var(--accent-yellow)] text-[#0D0D0D] border-[var(--accent-yellow)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-slate-700/30 hover:border-slate-600'
                  }`}
                >
                  {type === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'}
                </button>
              ))}
            </div>
          </div>

          <div className="card-dark p-5">
            <label className="text-sm font-medium text-[var(--text-primary)] mb-4 block">Duration (minutes)</label>
            <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
              {[1, 5, 15, 30, 60, 120, 180, 240].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`w-14 h-11 rounded-full text-sm font-bold transition border ${
                    duration === m
                      ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-slate-700/30 hover:border-slate-600'
                  }`}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {duration < 60 ? `${duration} Minutes` : `${duration / 60} Hour${duration / 60 > 1 ? 's' : ''}`}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {formatTime(startTime)} to {formatTime(endTime.toISOString())}
              </p>
            </div>
          </div>

          <div className="card-dark p-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">${slotPrice.toFixed(2)}/hour × {duration < 60 ? `${duration} min` : `${duration / 60}h`}</span>
              <span className="text-xl font-bold text-[var(--accent-yellow)]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={() => setStep(3)} className="btn-primary w-full">
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 max-w-lg mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Confirm Booking</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Review your details and checkout.</p>
          </div>

          <div className="card-dark p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
                placeholder="e.g. ABC-1234"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-full bg-[var(--bg-primary)] border border-r-0 border-slate-700/30 text-sm text-[var(--text-secondary)]">🇺🇸 +1</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-r-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="card-dark p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Slot</span>
                <span className="text-[var(--text-primary)] font-medium">{selectedSlot?.slotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">${slotPrice.toFixed(2)}/hour</span>
                <span className="text-[var(--text-primary)]">{duration < 60 ? `${duration} min` : `${duration / 60}h`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Place</span>
                <span className="text-[var(--text-primary)]">{area.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700/30">
                <span className="text-[var(--text-secondary)] font-medium">Total Amount</span>
                <span className="text-lg font-bold text-[var(--accent-yellow)]">${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="text-xs text-[var(--accent-purple)] hover:underline mt-1">+ Add EV Charging</button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!vehicleNumber.trim() || booking}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {booking ? 'Booking...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}
