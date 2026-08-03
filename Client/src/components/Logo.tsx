
export default function Logo() {
  return (
    <div className="flex items-center gap-2.5 mb-10">
      <img src="/logo.png" alt="ShortX Logo" className="w-8 h-8 object-contain" />
      <span className="text-xl font-extrabold text-gray-900 tracking-tight">ShortX</span>
    </div>
  );
}
