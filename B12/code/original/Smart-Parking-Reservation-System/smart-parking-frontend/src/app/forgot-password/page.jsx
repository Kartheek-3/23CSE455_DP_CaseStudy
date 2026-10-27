'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { Car, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      setMessage('');

      const response = await api.post('/auth/forgot-password', data);
      setMessage(response.data.message);

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)]" />

        <Link href="/login" className="absolute top-8 left-6 text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={20} />
        </Link>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-hover)] flex items-center justify-center">
                <Car size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-[#0D0D0D]">SmartPark</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Forgot Password</h2>
            <p className="text-slate-500 text-sm mt-1">
              Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>

          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm text-center border border-green-100 font-medium">
              {message}
              <br />
              <span className="text-xs">Redirecting to next step...</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled={isLoading || message}
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900 disabled:bg-slate-50"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || message}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
