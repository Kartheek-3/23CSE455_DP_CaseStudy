'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { Car, ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setSuccessMsg('Password changed successfully!');
      reset();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      const msg = error.response?.data?.message;
      setErrorMsg(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to change password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)]" />

        <div className="p-8">
          <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-slate-600 transition mb-4">
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-hover)] flex items-center justify-center">
                <Car size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-[#0D0D0D]">SmartPark</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
            <p className="text-slate-500 text-sm mt-1">Update your account password</p>
          </div>

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm text-center border border-green-100 font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                {...register('oldPassword', { required: 'Current password is required' })}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent text-sm text-slate-900"
                placeholder="Enter current password"
              />
              {errors.oldPassword && <p className="text-red-500 text-xs mt-1 ml-2">{errors.oldPassword.message}</p>}
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
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-purple-hover)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
