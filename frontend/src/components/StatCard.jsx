export default function StatCard({ title, value, warn }) {
  return (
    <div className={`p-4 rounded-lg shadow-lg transform hover:scale-105 transition bg-[#1b1f2b] ${warn ? 'border border-red-500' : ''}`}>
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
