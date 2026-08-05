import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validate = () => {
    const tempErrors: { email?: string } = {};
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        tempErrors.email = 'Please enter a valid email address';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setSuccess(data.message || 'If the email exists, a reset link has been sent.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Forgot password?</h1>
        <p className="text-sm text-gray-500">Enter your email and we'll send a reset link</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="forgot-email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              className={`w-full h-11 px-3.5 rounded-lg border bg-white text-gray-900 text-sm placeholder-gray-400 outline-none transition-all ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
              }`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-0.5 ml-1">{errors.email}</p>}
          </div>

          <button
            id="forgot-submit"
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mt-8">
        Remembered your password?{' '}
        <Link to="/login" replace className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
