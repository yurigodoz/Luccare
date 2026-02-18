'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

export default function DependentsPage() {
  return (
    <AuthGuard>
      <DependentContent />
    </AuthGuard>
  );
}

function DependentContent() {
  const [dependents, setDependents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();

  async function load() {
    const json = await apiFetch('/dependents');
    const list = Array.isArray(json) ? json : json?.data ?? json?.dependents ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    setDependents(list);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Dependentes
      </h1>

      <div className="space-y-4">
        {dependents.length === 0 && (
          <p className="text-gray-800">
            Nenhum dependente cadastrado.
          </p>
        )}

        {Array.isArray(dependents) ? dependents.map((dep) => (
          <div
            key={dep.id}
            className="bg-white rounded-2xl shadow p-4 cursor-pointer"
            onClick={() => toggleExpand(dep.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 truncate mr-2">
                {dep.name}
              </span>
              <span className="text-gray-400 text-sm flex-shrink-0">
                {expandedId === dep.id ? '▲' : '▼'}
              </span>
            </div>

            {(dep.birthDate || dep.notes) && (
              <div className="mt-1 text-sm text-gray-500">
                {dep.birthDate && <span>{new Date(dep.birthDate).toLocaleDateString('pt-BR')}</span>}
                {dep.birthDate && dep.notes && <span> · </span>}
                {dep.notes && <span>{dep.notes}</span>}
              </div>
            )}

            {expandedId === dep.id && (
              <div
                className="flex gap-2 mt-3 pt-3 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => router.push(`/dependents/${dep.id}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Rotinas
                </button>

                <button
                  onClick={() => router.push(`/dependents/${dep.id}/share`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Compartilhar
                </button>

                <button
                  onClick={() => router.push(`/dependents/${dep.id}/edit`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        )) : null}
      </div>

      {/* FAB - botão flutuante para adicionar dependente */}
      <button
        onClick={() => router.push('/dependents/new')}
        className="fixed bottom-24 sm:bottom-8 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
