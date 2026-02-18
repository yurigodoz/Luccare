'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

const ROLE_LABELS = {
  FAMILY: 'Familiar',
  CAREGIVER: 'Cuidador',
  PROFESSIONAL: 'Profissional',
};

export default function ShareDependentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [dependentName, setDependentName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CAREGIVER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  async function loadUsers() {
    try {
      const data = await apiFetch(`/dependents/${id}/users`);
      setUsers(data);
    } catch {
      // silently fail
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    apiFetch(`/dependents/${id}`).then((dep) => {
      if (dep?.name) setDependentName(dep.name);
    });
    loadUsers();
  }, [id]);

  async function handleShare() {
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      await apiFetch('/dependents/share', {
        method: 'POST',
        body: JSON.stringify({
          dependentId: Number(id),
          email,
          role,
        }),
      });

      setEmail('');
      setMessage('Compartilhado com sucesso!');
      loadUsers();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(userId, userName) {
    if (!confirm(`Remover acesso de ${userName}?`)) return;

    try {
      await apiFetch(`/dependents/${id}/users/${userId}`, {
        method: 'DELETE',
      });
      loadUsers();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-blue-50 p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Compartilhar {dependentName || 'dependente'}
        </h1>

        {/* Formulário de compartilhamento */}
        <div className="bg-white rounded-2xl shadow p-6 max-w-md space-y-4">
          <input
            type="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900"
          >
            <option value="FAMILY">Familiar</option>
            <option value="CAREGIVER">Cuidador</option>
            <option value="PROFESSIONAL">Profissional</option>
          </select>

          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Compartilhar'}
          </button>

          {message && (
            <p className="text-sm text-center text-gray-700">{message}</p>
          )}
        </div>

        {/* Lista de usuários com acesso */}
        <h2 className="text-lg font-semibold text-blue-900 mt-8 mb-3">
          Pessoas com acesso
        </h2>

        <div className="bg-white rounded-2xl shadow max-w-md divide-y divide-gray-100">
          {loadingUsers && (
            <p className="p-4 text-sm text-gray-500">Carregando...</p>
          )}

          {!loadingUsers && users.length === 0 && (
            <p className="p-4 text-sm text-gray-500">Nenhum usuário encontrado.</p>
          )}

          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center justify-between p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
                {user.role !== 'FAMILY' && (
                  <button
                    onClick={() => handleRevoke(user.userId, user.name)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-blue-600"
        >
          ← Voltar
        </button>
      </div>
    </AuthGuard>
  );
}
