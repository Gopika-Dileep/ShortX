import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#E8D8C4] py-6 px-6 bg-[#F9F6F0]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="ShortX Logo" className="w-6 h-6 object-contain" />
          <span className="text-sm font-bold text-gray-900">ShortX</span>
        </Link>
        {/* Copyright */}
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ShortX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
