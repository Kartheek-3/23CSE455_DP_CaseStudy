'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { Car } from 'lucide-react';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      await api.post('/auth/register', data);
      router.push('/login');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)]" />

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-hover)] flex items-center justify-center">
                <Car size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-[#0D0D0D]">SmartPark</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Create an Account</h2>
            <p className="text-slate-500 text-sm mt-1">Join SmartPark today</p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 text-left leading-relaxed">
              This application is hosted on a free server. If the app has been inactive, the server may enter sleep mode. Your first request may take 30–60 seconds to load. Thank you for your patience.
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-2">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                placeholder="At least 6 characters"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)] text-white font-semibold text-sm hover:opacity-90 transition"
            >
              Register
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent-purple)] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
