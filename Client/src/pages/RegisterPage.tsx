import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: { name?: string; email?: string; password?: string } = {};
    
    // Name verification
    if (!name.trim()) {
      tempErrors.name = 'Full name is required';
    }

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
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
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
      await authApi.register({ name, email, password });
      navigate('/verify-email', { state: { email }, replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Create account</h1>
        <p className="text-sm text-gray-500">Start shortening links with ShortX</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Your full name"
            className={`w-full h-11 px-3.5 rounded-lg border bg-white text-gray-900 text-sm placeholder-gray-400 outline-none transition-all ${
              errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
            }`}
          />
          {errors.name && <p className="text-xs text-red-600 mt-0.5 ml-1">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <input
            id="register-email"
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
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Min. 6 characters"
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
          id="register-submit"
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-8">
        Already have an account?{' '}
        <Link to="/login" replace className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
