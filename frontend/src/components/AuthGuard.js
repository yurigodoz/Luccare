'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    router.push('/');
                    return;
                }

                await apiFetch('/auth/validate-token');
                setIsAuthorized(true);
            } catch (error) {
                console.error('Erro ao validar token:', error);

                const isNetworkError = error instanceof TypeError || error.message === 'Sem conexão';
                if (isNetworkError) {
                    setNetworkError(true);
                    return;
                }

                // Sessão expirada — api.js já limpou o localStorage e redirecionou,
                // mas caso não tenha (ex: erro inesperado), garante o redirect aqui.
                if (!localStorage.getItem('accessToken')) {
                    router.push('/');
                }
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [router]);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (networkError) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Sem conexão com o servidor.</p>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
        );
    }

    return isAuthorized ? children : null;
}
