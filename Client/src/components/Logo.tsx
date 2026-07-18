import { Zap } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 mb-10">
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
        <Zap className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-lg font-bold text-gray-900 tracking-tight">ShortX</span>
    </div>
  );
}
