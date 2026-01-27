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
    <span className={`text-xs px-2 py-1 rounded-full ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  );
}

export default function DependentDetailPage() {
  const { id } = useParams();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [completedRoutines, setCompletedRoutines] = useState({});
  const [notes, setNotes] = useState({});
  const [savedNotes, setSavedNotes] = useState({});

  useEffect(() => {
    async function loadRoutines() {
      try {
        const data = await apiFetch(`/dependents/${id}/routines`);
        setRoutines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRoutines();
  }, [id]);

  async function handleMarkDone(routineId) {
    try {
      const log = await apiFetch(`/routines/${routineId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ status: 'DONE' }),
      });

      setCompletedRoutines(prev => ({
        ...prev,
        [routineId]: log,
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveNote(routineId) {
    try {
      const log = completedRoutines[routineId];

      await apiFetch(`/routines/logs/${log.id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: notes[routineId] }),
      });

      setSavedNotes(prev => ({
        ...prev,
        [routineId]: true,
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100 p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">
          Rotinas
        </h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(routine => {
            const isDone = completedRoutines[routine.id];

            return (
              <div
                key={routine.id}
                className={`rounded-xl shadow p-4 border-l-4 transition ${
                  isDone ? 'bg-green-50 border-green-500' : 'bg-white border-orange-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {routine.title}
                  </h2>
                  <TypeBadge type={routine.type} />
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {routine.times.map((time, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {time}
                    </span>
                  ))}
                </div>

                {!isDone && (
                  <button
                    onClick={() => handleMarkDone(routine.id)}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Marcar como feito
                  </button>
                )}

                {isDone && (
                  <>
                    <p className="text-green-700 text-sm mt-2 font-semibold">
                      Concluído
                    </p>

                    <div className="mt-3">
                      <textarea
                        placeholder="Adicionar observação (opcional)"
                        className="w-full border rounded-lg p-2 text-sm"
                        value={notes[routine.id] || ''}
                        onChange={e =>
                          setNotes(prev => ({
                            ...prev,
                            [routine.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        onClick={() => handleSaveNote(routine.id)}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                      >
                        Salvar observação
                      </button>

                      {savedNotes[routine.id] && (
                        <p className="text-green-600 text-xs mt-1">
                          Observação salva.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}