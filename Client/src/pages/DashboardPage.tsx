import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Link2, BarChart3, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/authSlice';
import { authApi } from '../api/auth.api';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">ShortX</span>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="max-w-[160px] truncate font-medium">{user?.name || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name || user?.email?.split('@')[0]}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Links', value: '—', icon: Link2 },
            { label: 'Total Clicks', value: '—', icon: BarChart3 },
            { label: 'Active Domains', value: '—', icon: Globe },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="bg-white border border-gray-200 rounded-xl px-8 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <Link2 className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1.5">No links yet</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            The URL shortener interface is coming soon. Your links will appear here.
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping inline-block" />
            Coming Soon
          </span>
        </div>
      </main>
    </div>
  );
}
