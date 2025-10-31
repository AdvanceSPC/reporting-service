'use client';
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [channel, setChannel] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    const res = await fetch(`/api/data?channel=${channel}&start=${start}&end=${end}`);
    const result = await res.json();
    setData(result);
  };

  if (!session) return <p className="p-4 text-center">Por favor, inicia sesión.</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Panel de Reportes IVR</h1>
        <button onClick={() => signOut()} className="bg-red-600 text-white px-3 py-1 rounded">Salir</button>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={channel} onChange={e => setChannel(e.target.value)} className="border p-2 rounded">
          <option value="">Todos los canales</option>
          <option value="IVR">IVR</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Messenger">Messenger</option>
        </select>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
      </div>

      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Canal</th>
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Mensaje</th>
            <th className="border p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.id}</td>
              <td className="border p-2">{row.channel}</td>
              <td className="border p-2">{row.caller}</td>
              <td className="border p-2">{row.message}</td>
              <td className="border p-2">{new Date(row.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
