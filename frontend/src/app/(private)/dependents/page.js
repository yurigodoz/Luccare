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
  const [name, setName] = useState('');
  const router = useRouter();

  async function load() {
    const token = localStorage.getItem('accessToken');

    const json = await apiFetch('/dependents');

    const list = Array.isArray(json) ? json : json?.data ?? json?.dependents ?? [];
    setDependents(list);
  }

  useEffect(() => {
    load();
  }, []);

  async function createDependent() {
    if (!name.trim()) return;

    const token = localStorage.getItem('accessToken');

    await apiFetch('/dependents', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    setName('');
    load();
  }

  async function removeDependent(id) {
    const token = localStorage.getItem('accessToken');

    if (!confirm('Deseja excluir este dependente?')) return;

    await apiFetch(`/dependents/${id}`, {
      method: 'DELETE',
    });

    load();
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Dependentes
      </h1>

      {/* ➕ Criar */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-3">
        <input
          placeholder="Nome do dependente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-gray-900"
        />

        <button
          onClick={createDependent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
        >
          + Adicionar
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {dependents.length === 0 && (
          <p className="text-gray-800">
            Nenhum dependente cadastrado.
          </p>
        )}

        {Array.isArray(dependents) ? dependents.map((dep) => (
          <div
            key={dep.id}
            className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
          >
            <span className="font-semibold text-gray-900">
              {dep.name}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(`/dependents/${dep.id}`)
                }
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Rotinas
              </button>

              <button
                onClick={() =>
                  router.push(`/dependents/${dep.id}/share`)
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Compartilhar
              </button>

              <button
                onClick={() => removeDependent(dep.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        )) : null}
      </div>
    </div>
  );
}