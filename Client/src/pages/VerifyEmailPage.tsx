import { useState, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email: string = (location.state as any)?.email ?? '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const updated = [...otp];
    pasted.split('').forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.verifyEmail({ email, otp: code });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid code. Please try again.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('');
    try {
      await authApi.resendOtp(email);
      setSuccess('A new code has been sent to your email.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Check your email</h1>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to{' '}
          <span className="text-gray-800 font-medium">{email || 'your email'}</span>
        </p>
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

      {/* OTP grid */}
      <div className="grid grid-cols-6 gap-2.5 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="aspect-square text-center text-xl font-bold rounded-lg border border-gray-200 bg-white text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 caret-indigo-500"
          />
        ))}
      </div>

      <button
        id="verify-submit"
        onClick={handleVerify}
        disabled={loading}
        className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Verifying…' : 'Verify email'}
      </button>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleResend}
          disabled={resending}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {resending ? 'Sending…' : 'Resend code'}
        </button>
        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
