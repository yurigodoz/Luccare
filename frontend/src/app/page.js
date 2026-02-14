'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isWarmingUp, setIsWarmingUp] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      window.location.href = '/dashboard';
      return;
    }

    const wakeUpBackend = async () => {
      let attempts = 0;
      const maxAttempts = 30;
      const delayBetweenAttempts = 1000;

      const tryHealth = async () => {
        while (attempts < maxAttempts) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
              method: 'GET',
            });

            console.log(`Health check attempt ${attempts + 1}: ${response.status}`);

            if (response.status === 200) {
              console.log('Servidor acordado com sucesso!');
              setIsWarmingUp(false);
              return;
            }
          } catch (err) {
            console.log(`Health check attempt ${attempts + 1} failed:`, err.message);
          }

          attempts++;

          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
          }
        }

        console.log('Esgotadas as tentativas. Liberando botão mesmo assim.');
        setIsWarmingUp(false);
      };

      tryHealth();
    };

    wakeUpBackend();
  }, []);

  function toggleMode() {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setName('');
      setPassword('');
      setIsRegister(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Luccare
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Cuidado e rotina com carinho
        </p>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nome"
              className="w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="E-mail"
            className="w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isWarmingUp}
            className={`w-full font-semibold py-2 rounded-lg transition ${
              isWarmingUp
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isWarmingUp ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Aquecendo servidor...
              </span>
            ) : (
              isRegister ? 'Cadastrar' : 'Entrar'
            )}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center mt-4">{success}</p>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? (
            <>
              Já tem conta?{' '}
              <button onClick={toggleMode} className="text-blue-600 hover:underline font-medium">
                Entrar
              </button>
            </>
          ) : (
            <>
              Não tem conta?{' '}
              <button onClick={toggleMode} className="text-blue-600 hover:underline font-medium">
                Cadastre-se
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
