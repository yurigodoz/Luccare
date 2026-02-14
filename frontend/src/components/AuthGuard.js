'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

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
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [router]);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return isAuthorized ? children : null;
}
