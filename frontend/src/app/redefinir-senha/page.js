'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Token inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500">
          Link de redefinição inválido — nenhum token foi informado.
        </p>
        <Link href="/esqueci-senha" className="inline-block mt-6 text-blue-600 hover:underline font-medium">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <p className="text-green-600">
          Senha redefinida com sucesso!
        </p>
        <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline font-medium">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        placeholder="Nova senha (mínimo 8 caracteres)"
        className="w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full font-semibold py-2 rounded-lg transition ${
          isSubmitting
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
      </button>

      {error && (
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <Link href="/esqueci-senha" className="text-blue-600 hover:underline text-sm font-medium">
            Solicitar novo link
          </Link>
        </div>
      )}
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Luccare
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Redefinir senha
        </p>

        <Suspense fallback={<p className="text-center text-gray-500">Carregando...</p>}>
          <RedefinirSenhaForm />
        </Suspense>
      </div>
    </div>
  );
}
