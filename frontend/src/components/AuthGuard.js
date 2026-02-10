'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setIsAuthorized(true);
                } else {
                    localStorage.removeItem('token');
                    router.push('/');
                }
            } catch (error) {
                console.error('Erro ao validar token:', error);
                localStorage.removeItem('token');
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
