"use client";
export default function DashboardError({ error, reset }: any) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold">Bir hatayla karşılaşıldı</h2>
      <p className="mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-gray-800 text-white rounded">Tekrar Dene</button>
    </div>
  );
}