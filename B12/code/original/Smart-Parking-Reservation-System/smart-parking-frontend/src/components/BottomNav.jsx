'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Home, Heart, ClipboardList, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard/user', label: 'Home', icon: Home },
  { href: '#', label: 'Favorites', icon: Heart },
  { href: '/reservations', label: 'My Bookings', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user || user.role === 'admin') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)]/90 backdrop-blur-md border-t border-slate-700/30 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '#' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition ${
                isActive
                  ? 'text-[var(--accent-purple)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={20} fill={isActive ? 'var(--accent-purple)' : 'none'} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
