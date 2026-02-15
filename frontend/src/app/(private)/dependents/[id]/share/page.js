'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch } from '@/services/api';

export default function ShareDependentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [dependentName, setDependentName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CAREGIVER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch(`/dependents/${id}`).then((dep) => {
      if (dep?.name) setDependentName(dep.name);
    });
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
      setMessage('Compartilhado com sucesso ✅');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-blue-50 p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Compartilhar {dependentName || 'dependente'}
        </h1>

        <div className="bg-white rounded-2xl shadow p-6 max-w-md space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900"
          />

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900"
          >
            <option value="FAMILY">Familiar</option>
            <option value="CAREGIVER">Cuidador</option>
            <option value="PROFESSIONAL">Profissional</option>
          </select>

          {/* Botão */}
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Compartilhar'}
          </button>

          {/* Mensagem */}
          {message && (
            <p className="text-sm text-center text-gray-700">{message}</p>
          )}

          {/* Voltar */}
          <button
            onClick={() => router.back()}
            className="w-full text-sm text-blue-600"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}