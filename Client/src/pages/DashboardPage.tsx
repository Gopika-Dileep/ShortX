import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Zap,
  Link2,
  BarChart3,
  Globe,
  Copy,
  Trash2,
  ExternalLink,
  AlertCircle,
  Check,
  Loader2,
  Search,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/authSlice';
import { authApi } from '../api/auth.api';
import { urlApi, type UrlItem } from '../api/url.api';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // States
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [activeDomains, setActiveDomains] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search query changes by 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to page 1 on new search terms
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Load user's URLs based on page, limit, and debounced search query
  const fetchUrls = async () => {
    setLoading(true);
    try {
      const response = await urlApi.getMyUrls(page, limit, debouncedSearchQuery);
      const resData: any = response.data;
      if (resData && Array.isArray(resData)) {
        setUrls(resData);
        setTotal(resData.length);
        setTotalClicks(resData.reduce((sum: number, item: any) => sum + (item.clicks || 0), 0));
        setActiveDomains(new Set(resData.map((item: any) => {
          try {
            return new URL(item.originalUrl).hostname;
          } catch {
            return '';
          }
        }).filter(Boolean)).size);
        setTotalPages(1);
      } else if (resData && resData.data) {
        setUrls(resData.data || []);
        setTotal(resData.total || 0);
        setTotalClicks(resData.totalClicks || 0);
        setActiveDomains(resData.activeDomains || 0);
        setTotalPages(resData.totalPages || 0);
      } else {
        setUrls([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch URLs:', err);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [page, limit, debouncedSearchQuery]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    dispatch(clearCredentials());
    navigate('/login');
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    if (!originalUrl) {
      setFormError('Please enter a destination URL');
      setFormLoading(false);
      return;
    }

    try {
      const res = await urlApi.shorten(originalUrl, customCode || undefined);
      setOriginalUrl('');
      setCustomCode('');
      setFormSuccess(res.data.shortCode);
      
      // Reset view to first page, clear search query and reload list to show newest item
      setPage(1);
      setSearchQuery('');
      setDebouncedSearchQuery('');
      await fetchUrls();

      // Auto dismiss success banner after 5s
      setTimeout(() => setFormSuccess(null), 5000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to shorten URL';
      setFormError(Array.isArray(message) ? message[0] : message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await urlApi.delete(id);
      
      // If we are deleting the last item on a page > 1, go back one page. Otherwise refetch.
      if (urls.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchUrls();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete URL');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (shortCode: string, id: string) => {
    const fullUrl = getShortenedUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getShortenedUrl = (shortCode: string) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/url/${shortCode}`;
  };

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md animate-pulse-glow">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">ShortX</span>
          </div>

          {/* User profile + Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-sm text-gray-700">
              <div className="w-6.5 h-6.5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-extrabold text-white">
                {initials}
              </div>
              <span className="max-w-[160px] truncate font-semibold text-gray-800">
                {user?.name || user?.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 animate-slide-up">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Link Center
          </h1>
          <p className="text-gray-500 mt-1">
            Shorten links, track click counts, and manage your custom paths.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Links', value: total, icon: Link2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Total Redirect Clicks', value: totalClicks, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Target Domains', value: activeDomains, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {loading ? (
                    <span className="block w-12 h-6 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shortener Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-600" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            Shorten a new URL
          </h2>

          <form onSubmit={handleShorten} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Long URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Destination URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-original-url"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Custom Short Code */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Custom Code (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-gray-400">
                    /
                  </div>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="promo-code"
                    className="block w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Error / Success Notifications */}
            {formError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-center justify-between gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <p className="font-medium">
                    Shortened URL generated successfully:
                    <span className="ml-1.5 font-bold select-all underline text-indigo-700">
                      {getShortenedUrl(formSuccess)}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(formSuccess, 'form-success')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-600 rounded-md transition-all cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy Link
                </button>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Generate Shortened Link
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* URLs Table and Listing */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Header & Search */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Short Links</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total found: {total}
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code or destination..."
                className="block w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List Table */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">Loading links...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {searchQuery ? 'No results found' : 'No shortened links yet'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try adjusting your search filters or query words.'
                  : 'Start by inputting a long destination link above to shorten it.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Short Link</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4 text-center">Clicks</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {urls.map((item) => {
                      const shortLink = getShortenedUrl(item.shortCode);
                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Short Link URL */}
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-md text-xs border border-indigo-100/50">
                                /{item.shortCode}
                              </span>
                              <button
                                onClick={() => handleCopy(item.shortCode, item._id)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                                title="Copy URL"
                              >
                                {copiedId === item._id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={shortLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                title="Open link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>

                          {/* Original URL */}
                          <td className="px-6 py-4 max-w-[280px]">
                            <p className="truncate text-xs text-gray-400 font-mono" title={item.originalUrl}>
                              {item.originalUrl}
                            </p>
                          </td>

                          {/* Clicks */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {item.clicks}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                              title="Delete Short Link"
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">{Math.min(page * limit, total)}</span> of{' '}
                    <span className="font-semibold text-gray-900">{total}</span> links
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Show</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1); // reset to page 1
                      }}
                      className="bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {[10, 20, 50].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs font-sans"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs font-sans"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
