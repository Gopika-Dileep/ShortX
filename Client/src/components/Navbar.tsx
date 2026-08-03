import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/authSlice';
import { authApi } from '../api/auth.api';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#F9F6F0]/80 backdrop-blur-md border-b border-[#E8D8C4] shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="ShortX Logo" className="w-9 h-9 object-contain" />
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">ShortX</span>
        </Link>

        {/* Dynamic Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Go to Dashboard Link */}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-[#6D2932] hover:text-[#561C24] hover:bg-[#E8D8C4]/30 rounded-lg transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[#E8D8C4] text-sm">
                <div className="w-6.5 h-6.5 rounded-full bg-[#561C24] flex items-center justify-center text-[10px] font-extrabold text-white">
                  {initials}
                </div>
                <span className="max-w-[140px] truncate font-semibold text-gray-800 hidden sm:inline">
                  {user?.name || user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8D8C4] text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest links */}
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#6D2932] hover:text-[#561C24] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#561C24] hover:bg-[#411218] rounded-lg transition-all shadow-2xs"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
