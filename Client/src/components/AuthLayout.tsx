import type { ReactNode } from 'react';
import { Link2, Zap, Shield, BarChart3 } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Create short links in seconds' },
  { icon: Shield, text: 'Secure & reliable by default' },
  { icon: BarChart3, text: 'Track clicks and analytics' },
  { icon: Link2, text: 'Custom aliases for your brand' },
];

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left: Branded Panel ───────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #4338ca 0%, #6366f1 45%, #818cf8 100%)' }}>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(35%, -35%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-35%, 35%)' }} />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ShortX</span>
        </div>

        {/* Headline & features */}
        <div className="relative z-10 animate-fade-in">
          <p className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-4">URL Shortener Platform</p>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-5">
            Shorten smarter.<br />Share faster.
          </h2>
          <p className="text-indigo-100/80 text-base leading-relaxed mb-10 max-w-sm">
            Every link, optimised. ShortX gives you blazing-fast short URLs with real-time analytics and custom branding.
          </p>

          <ul className="flex flex-col gap-3.5">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/85 font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-indigo-300/70 text-xs">© {new Date().getFullYear()} ShortX. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-10 py-14 bg-white min-h-screen lg:max-w-[480px] xl:max-w-[520px]">
        <div className="w-full max-w-sm mx-auto animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}
