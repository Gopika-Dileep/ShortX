
export default function Logo() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <img src="/logo.png" alt="ShortX Logo" className="w-12 h-12 object-contain" />
      <span className="text-2xl font-extrabold text-gray-900 tracking-tight">ShortX</span>
    </div>
  );
}
