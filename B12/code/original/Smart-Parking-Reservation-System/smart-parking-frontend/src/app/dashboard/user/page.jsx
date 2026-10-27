'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Search, ArrowRight, Car } from 'lucide-react';

const gradients = [
  'from-violet-600 to-indigo-700',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-600 to-pink-600',
  'from-sky-600 to-blue-700',
];

const dummyDistances = [
  { km: '1.2', min: '4' },
  { km: '2.5', min: '8' },
  { km: '0.8', min: '3' },
  { km: '3.1', min: '10' },
  { km: '1.8', min: '6' },
  { km: '4.2', min: '14' },
];

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/parking?search=${searchTerm}`);
        setParkingAreas(response.data.data);
      } catch (error) {
        console.error('Failed to fetch parking areas', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchParking();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const getPriceRange = (area) => {
    const prices = (area.slots || []).map(
      (s) => parseFloat(s.pricePerHour ?? area.pricePerHour)
    );
    if (prices.length === 0) return { min: area.pricePerHour, max: area.pricePerHour };
    return {
      min: Math.min(...prices).toFixed(2),
      max: Math.max(...prices).toFixed(2),
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Find Your Parking Space
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
          Hi, {user?.fullName || 'Driver'}! Book a spot in seconds.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <input
          type="text"
          className="block w-full pl-5 pr-14 py-3 rounded-full bg-[var(--bg-card)] border border-slate-700/30 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] text-sm transition"
          placeholder="Search for a parking location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-hover)] transition">
          <Search size={16} className="text-white" />
        </button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:mx-0 sm:px-0 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-dark p-0 min-w-[280px] sm:min-w-0 animate-pulse">
              <div className="h-36 bg-slate-700/30 rounded-t-[1rem]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-700/30 rounded w-3/4" />
                <div className="h-3 bg-slate-700/30 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : parkingAreas.length === 0 ? (
        <div className="card-dark p-10 text-center text-[var(--text-secondary)]">
          <Car size={40} className="mx-auto mb-3 opacity-40" />
          No parking areas found.
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:hidden">
            {parkingAreas.map((area, index) => {
              const range = getPriceRange(area);
              const dist = dummyDistances[index % dummyDistances.length];
              const grad = gradients[index % gradients.length];
              return (
                <Link
                  key={area.id}
                  href={`/parking/${area.id}`}
                  className="card-dark p-0 min-w-[280px] flex-shrink-0 hover:ring-1 hover:ring-[var(--accent-purple)] transition-all duration-200 group"
                >
                  <div className={`h-36 rounded-t-[1rem] bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
                    <Car size={48} className="text-white/30" />
                    <span className="absolute top-3 right-3 bg-[var(--accent-yellow)] text-[#0D0D0D] text-xs font-bold px-2.5 py-1 rounded-full">
                      ${range.min} - ${range.max} / hour
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{area.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{area.location || 'Location not specified'}</p>
                      </div>
                      <ArrowRight size={18} className="text-[var(--accent-purple)] mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center mt-3 text-[11px] text-[var(--text-secondary)]">
                      <span>{dist.km}km</span>
                      <span className="mx-1.5">·</span>
                      <span>{dist.min}min away</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingAreas.map((area, index) => {
              const range = getPriceRange(area);
              const dist = dummyDistances[index % dummyDistances.length];
              const grad = gradients[index % gradients.length];
              return (
                <Link
                  key={area.id}
                  href={`/parking/${area.id}`}
                  className="card-dark p-0 hover:ring-1 hover:ring-[var(--accent-purple)] transition-all duration-200 group"
                >
                  <div className={`h-36 rounded-t-[1rem] bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
                    <Car size={48} className="text-white/30" />
                    <span className="absolute top-3 right-3 bg-[var(--accent-yellow)] text-[#0D0D0D] text-xs font-bold px-2.5 py-1 rounded-full">
                      ${range.min} - ${range.max} / hour
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{area.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{area.location || 'Location not specified'}</p>
                      </div>
                      <ArrowRight size={18} className="text-[var(--accent-purple)] mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center mt-3 text-[11px] text-[var(--text-secondary)]">
                      <span>{dist.km}km</span>
                      <span className="mx-1.5">·</span>
                      <span>{dist.min}min away</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
