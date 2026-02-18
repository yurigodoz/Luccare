'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

const TYPE_LABELS = {
  MEDICATION: 'Medicamento',
  FEEDING: 'Alimentação',
  THERAPY: 'Terapia',
  HYGIENE: 'Higiene',
  EXERCISE: 'Exercício',
  OTHER: 'Outro',
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function TypeBadge({ type }) {
  const colors = {
    MEDICATION: 'bg-blue-100 text-blue-700',
    FEEDING: 'bg-green-100 text-green-700',
    THERAPY: 'bg-purple-100 text-purple-700',
    HYGIENE: 'bg-teal-100 text-teal-700',
    EXERCISE: 'bg-orange-100 text-orange-700',
    OTHER: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        colors[type] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {TYPE_LABELS[type] || type}
    </span>
  );
}

export default function DependentDetailPage() {
  return (
    <AuthGuard>
      <DependentDetailContent />
    </AuthGuard>
  );
}

function DependentDetailContent() {
  const { id } = useParams();
  const router = useRouter();

  const [routines, setRoutines] = useState([]);
  const [dependentName, setDependentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  async function load() {
    const [routinesData, dependent] = await Promise.all([
      apiFetch(`/dependents/${id}/routines`),
      apiFetch(`/dependents/${id}`),
    ]);
    setRoutines(routinesData);
    if (dependent?.name) setDependentName(dependent.name);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function removeRoutine(routineId) {
    if (!confirm('Excluir rotina?')) return;

    await apiFetch(`/routines/${routineId}`, {
      method: 'DELETE',
    });

    setExpandedId(null);
    load();
  }

  function toggleExpand(routineId) {
    setExpandedId(expandedId === routineId ? null : routineId);
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Rotinas {dependentName ? `de ${dependentName}` : 'do dependente'}
      </h1>

      {loading && <p>Carregando...</p>}

      <div className="space-y-4">
        {!loading && routines.length === 0 && (
          <p className="text-gray-800">Nenhuma rotina cadastrada.</p>
        )}

        {routines.map((routine) => (
          <div
            key={routine.id}
            className="bg-white rounded-2xl shadow p-4 cursor-pointer"
            onClick={() => toggleExpand(routine.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {routine.title}
                </h2>
                <TypeBadge type={routine.type} />
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0 ml-2">
                {expandedId === routine.id ? '▲' : '▼'}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              {routine.times.map((t, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  {t}
                </span>
              ))}
            </div>

            {expandedId === routine.id && (
              <div
                className="mt-3 pt-3 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                {routine.description && (
                  <p className="text-sm text-gray-600 mb-2">{routine.description}</p>
                )}

                <div className="flex gap-1 flex-wrap mb-3">
                  {DAY_LABELS.map((day, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${
                        routine.daysOfWeek?.includes(i)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dependents/${id}/routines/${routine.id}/edit`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removeRoutine(routine.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB - botão flutuante para criar rotina */}
      <button
        onClick={() => router.push(`/dependents/${id}/routines/new`)}
        className="fixed bottom-24 sm:bottom-8 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
