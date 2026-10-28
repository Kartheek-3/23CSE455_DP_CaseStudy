'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Car, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const payload = {
        email: emailFromUrl,
        code: data.code,
        newPassword: data.newPassword,
      };

      const response = await api.post('/auth/reset-password', payload);
      setSuccessMsg(response.data.message);

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!emailFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D] px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <p className="text-slate-600 mb-4">You are missing an email address to reset.</p>
          <Link href="/forgot-password" className="btn-primary text-sm inline-block px-6 py-2.5">
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

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
            <h2 className="text-xl font-bold text-slate-800">Set New Password</h2>
            <p className="text-slate-500 text-sm mt-1">
              Enter the code sent to <strong className="text-slate-700">{emailFromUrl}</strong>
            </p>
          </div>

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm text-center border border-green-100 font-medium">
              {successMsg}
              <br />
              <span className="text-xs">Redirecting to login...</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Reset Code</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="123456"
                  {...register('code', {
                    required: 'Code is required',
                    minLength: { value: 6, message: 'Code must be 6 digits' },
                  })}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-center tracking-widest text-lg font-bold text-slate-900"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1 ml-2">{errors.code.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                  placeholder="At least 6 characters"
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1 ml-2">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                  placeholder="Repeat your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
