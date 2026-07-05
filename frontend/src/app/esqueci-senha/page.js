'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      // Mensagem de confirmação é sempre exibida, independente do resultado
      // (evita revelar se o e-mail existe ou não).
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Luccare
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Esqueci minha senha
        </p>

        {submitted ? (
          <div className="text-center">
            <p className="text-gray-700">
              Se os dados estiverem corretos, um e-mail com instruções para redefinir sua senha foi enviado.
            </p>
            <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline font-medium">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/" className="text-blue-600 hover:underline font-medium">
                Voltar para o login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
