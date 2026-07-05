'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

function VerificarEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Link de verificação inválido — nenhum token foi informado.');
      return;
    }

    apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setError(err.message || 'Token inválido ou expirado.');
      });
  }, [token]);

  if (status === 'loading') {
    return <p className="text-center text-gray-500">Verificando seu e-mail...</p>;
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="text-green-600">E-mail verificado! Faça login.</p>
        <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline font-medium">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-red-500">{error}</p>
      <p className="text-gray-500 text-sm mt-2">
        Tente fazer login para solicitar o reenvio do e-mail de verificação.
      </p>
      <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline font-medium">
        Ir para o login
      </Link>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Luccare
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Verificação de e-mail
        </p>

        <Suspense fallback={<p className="text-center text-gray-500">Carregando...</p>}>
          <VerificarEmailStatus />
        </Suspense>
      </div>
    </div>
  );
}
