'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

export default function DependentsPage() {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDependents() {
      try {
        const data = await apiFetch('/dependents');
        setDependents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDependents();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100 p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">
          Meus Dependentes
        </h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && dependents.length === 0 && (
          <p className="text-gray-700">
            Nenhum dependente cadastrado.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dependents.map(dep => (
            <Link
              key={dep.id}
              href={`/dashboard/dependents/${dep.id}`}
              className="bg-white rounded-xl shadow hover:shadow-md transition p-4 border-l-4 border-orange-500"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {dep.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ver rotinas
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}