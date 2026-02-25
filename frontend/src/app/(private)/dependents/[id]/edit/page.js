'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';

export default function EditDependentPage() {
  return (
    <AuthGuard>
      <EditDependentContent />
    </AuthGuard>
  );
}

function EditDependentContent() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function loadDependent() {
    try {
      const dep = await apiFetch(`/dependents/${id}`);
      setName(dep.name || '');
      setBirthDate(dep.birthDate ? new Date(dep.birthDate).toISOString().split('T')[0] : '');
      setNotes(dep.notes || '');
    } catch (err) {
      setError('Erro ao carregar dependente.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDependent();
  }, [id]);

  useRefetchOnFocus(loadDependent);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    try {
      const body = { name: name.trim() };
      if (birthDate) body.birthDate = birthDate;
      if (notes.trim()) body.notes = notes.trim();

      await apiFetch(`/dependents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      router.push('/dependents');
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dependente.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Deseja excluir este dependente?')) return;

    try {
      await apiFetch(`/dependents/${id}`, {
        method: 'DELETE',
      });
      router.push('/dependents');
    } catch (err) {
      setError(err.message || 'Erro ao excluir dependente.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <p className="text-gray-800">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-3">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Editar dependente
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            placeholder="Nome do dependente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={25}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de nascimento
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            placeholder="Ex: NBIA5, alergia a glúten..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/dependents')}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Excluir dependente
        </button>
      </div>
    </div>
  );
}
