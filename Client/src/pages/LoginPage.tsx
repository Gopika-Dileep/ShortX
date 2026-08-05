import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    
    // Email verification
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        tempErrors.email = 'Please enter a valid email address';
      }
    }

    // Password verification
    if (!password) {
      tempErrors.password = 'Password is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your ShortX account</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <input
            id="login-email"
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" replace className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              className={`w-full h-11 px-3.5 pr-11 rounded-lg border bg-white text-gray-900 text-sm placeholder-gray-400 outline-none transition-all ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-0.5 ml-1">{errors.password}</p>}
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-8">
        Don't have an account?{' '}
        <Link to="/register" replace className="text-indigo-600 font-medium hover:text-indigo-700">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
