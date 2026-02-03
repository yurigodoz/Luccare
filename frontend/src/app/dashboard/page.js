'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/today`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markDone(scheduleId, notes) {
    const token = localStorage.getItem('token');

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/done`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      }
    );

    load();
  }

  if (loading) {
    return <p className="p-6 text-gray-700">Carregando...</p>;
  }

  if (!data.length) {
    return <p className="p-6 text-gray-800">Nada para hoje 🎉</p>;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Rotina de hoje
      </h1>

      <div className="space-y-5">
        {data.map((dep) => (
          <DependentCard
            key={dep.dependentId}
            dependent={dep}
            onDone={markDone}
          />
        ))}
      </div>
    </div>
  );
}

function DependentCard({ dependent, onDone }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <h2 className="font-bold text-lg text-gray-900 mb-4">
        👤 {dependent.dependentName}
      </h2>

      <div className="space-y-3">
        {dependent.items.map((item) => (
          <ScheduleItem
            key={item.scheduleId}
            item={item}
            onDone={onDone}
          />
        ))}
      </div>
    </div>
  );
}

function ScheduleItem({ item, onDone }) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const done = item.done;

  async function handleDone() {
    setSaving(true);
    const normalizedNotes = notes.trim() === '' ? null : notes;
    await onDone(item.scheduleId, normalizedNotes);
    setSaving(false);
  }

  return (
    <div
      className={`
        rounded-xl border p-4 transition
        ${done
          ? 'bg-green-50 border-green-200'
          : 'bg-orange-50 border-orange-200'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-700">{item.time}</p>
        </div>

        {done ? (
          <span className="text-green-700 font-semibold text-sm">
            ✓ Concluído
          </span>
        ) : (
          <button
            onClick={handleDone}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : '✓ Feito'}
          </button>
        )}
      </div>

      {!done && (
        <input
          placeholder="Observação (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="
            w-full mt-2
            rounded-lg border border-gray-300
            px-3 py-2 text-sm
            text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        />
      )}
    </div>
  );
}