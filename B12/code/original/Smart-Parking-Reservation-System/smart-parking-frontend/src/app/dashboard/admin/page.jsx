'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { Map, Grid, CalendarCheck, Car, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ areas: 0, slots: 0, active: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [areasRes, slotsRes, reservationsRes] = await Promise.all([
          api.get('/parking'),
          api.get('/slots'),
          api.get('/reservations?status=active'),
        ]);
        setStats({
          areas: areasRes.data.data?.length || 0,
          slots: slotsRes.data?.length || 0,
          active: reservationsRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-hover)] flex items-center justify-center">
          <ShieldAlert size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Admin Control Center</h1>
          <p className="text-sm text-[var(--text-secondary)]">Logged in as {user?.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-dark p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-purple)]/15 flex items-center justify-center flex-shrink-0">
            <Map size={24} className="text-[var(--accent-purple)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.areas}</p>
            <p className="text-xs text-[var(--text-secondary)]">Parking Areas</p>
          </div>
        </div>
        <div className="card-dark p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-yellow)]/15 flex items-center justify-center flex-shrink-0">
            <Grid size={24} className="text-[var(--accent-yellow)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.slots}</p>
            <p className="text-xs text-[var(--text-secondary)]">Total Slots</p>
          </div>
        </div>
        <div className="card-dark p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--status-active)]/15 flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={24} className="text-[var(--status-active)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.active}</p>
            <p className="text-xs text-[var(--text-secondary)]">Active Reservations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/locations">
          <div className="card-dark p-6 hover:ring-1 hover:ring-[var(--accent-purple)] transition-all duration-200 group cursor-pointer h-full">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-purple)]/15 flex items-center justify-center mb-4 group-hover:bg-[var(--accent-purple)]/25 transition">
              <Map size={28} className="text-[var(--accent-purple)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Manage Locations</h2>
            <p className="text-sm text-[var(--text-secondary)]">Add, edit, or remove parking areas.</p>
          </div>
        </Link>

        <Link href="/dashboard/admin/slots">
          <div className="card-dark p-6 hover:ring-1 hover:ring-[var(--accent-purple)] transition-all duration-200 group cursor-pointer h-full">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-yellow)]/15 flex items-center justify-center mb-4 group-hover:bg-[var(--accent-yellow)]/25 transition">
              <Grid size={28} className="text-[var(--accent-yellow)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Manage Slots</h2>
            <p className="text-sm text-[var(--text-secondary)]">Create and assign parking spaces.</p>
          </div>
        </Link>

        <Link href="/dashboard/admin/reservations">
          <div className="card-dark p-6 hover:ring-1 hover:ring-[var(--accent-purple)] transition-all duration-200 group cursor-pointer h-full">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-active)]/15 flex items-center justify-center mb-4 group-hover:bg-[var(--status-active)]/25 transition">
              <CalendarCheck size={28} className="text-[var(--status-active)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Manage Reservations</h2>
            <p className="text-sm text-[var(--text-secondary)]">Monitor all user reservations.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
