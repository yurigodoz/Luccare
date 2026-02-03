'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

function TypeBadge({ type }) {
  const colors = {
    MEDICATION: 'bg-blue-100 text-blue-700',
    FOOD: 'bg-green-100 text-green-700',
    THERAPY: 'bg-purple-100 text-purple-700',
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        colors[type] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {type}
    </span>
  );
}

export default function DependentDetailPage() {
  const { id } = useParams();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [times, setTimes] = useState('');

  async function load() {
    const data = await apiFetch(`/dependents/${id}/routines`);
    setRoutines(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function createRoutine() {
    if (!title.trim()) return;

    const timeArray = times
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await apiFetch(`/dependents/${id}/routines`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'MEDICATION',
        title,
        times: timeArray,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      }),
    });

    setTitle('');
    setTimes('');
    load();
  }

  async function removeRoutine(routineId) {
    if (!confirm('Excluir rotina?')) return;

    await apiFetch(`/routines/${routineId}`, {
      method: 'DELETE',
    });

    load();
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-blue-50 p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Rotinas do dependente
        </h1>

        {/* ➕ Criar rotina */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-3">
          <input
            placeholder="Nome da rotina (ex: Domperidona)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-gray-900"
          />

          <input
            placeholder="Horários (07:00, 13:00, 18:00)"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-gray-900"
          />

          <button
            onClick={createRoutine}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
          >
            + Criar
          </button>
        </div>

        {loading && <p>Carregando...</p>}

        <div className="space-y-4">
          {routines.length === 0 && (
            <p className="text-gray-800">Nenhuma rotina cadastrada.</p>
          )}

          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-white rounded-2xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-gray-900">
                    {routine.title}
                  </h2>
                  <TypeBadge type={routine.type} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {routine.times.map((t, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => removeRoutine(routine.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}