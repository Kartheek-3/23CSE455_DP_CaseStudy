'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Car, MapPin, Bell, ClipboardList, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hydrateFromCookies } = useAuthStore();
  const logoHref = user
    ? user.role === 'admin'
      ? '/dashboard/admin'
      : '/dashboard/user'
    : '/login';

  useEffect(() => {
    hydrateFromCookies();
  }, [hydrateFromCookies]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  if (!user || isAdmin) {
    return (
      <nav className="bg-[var(--bg-card)] border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href={logoHref} className="flex items-center space-x-2 text-[var(--accent-yellow)] hover:opacity-80 transition">
              <Car size={26} />
              <span className="font-bold text-xl tracking-wide">SmartPark</span>
            </Link>

            {!user ? (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-medium">
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard/admin" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-medium">
                  Admin Panel
                </Link>
                <span className="text-slate-600 text-sm">Hi, {user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[var(--status-cancelled)] hover:opacity-80 transition font-medium"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
            <MapPin size={16} className="text-[var(--accent-yellow)]" />
            <span className="text-xs">Main Branch</span>
          </div>

          <Link href={logoHref} className="flex items-center space-x-2 text-[var(--accent-yellow)] hover:opacity-80 transition absolute left-1/2 -translate-x-1/2">
            <Car size={22} />
            <span className="font-bold text-base tracking-wide">SmartPark</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/reservations" className="flex items-center space-x-1 text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition text-xs font-medium">
              <ClipboardList size={14} />
              <span className="hidden sm:inline">My Bookings</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-1 text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition text-xs font-medium">
              <User size={14} />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition" title="Notifications">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--status-active)] rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-[var(--status-cancelled)] hover:opacity-80 transition font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
