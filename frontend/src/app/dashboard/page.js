'use client';

import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
    return (
        <AuthGuard>
        <h1>Dashboard LuccaCare</h1>
        <p>Você está autenticado.</p>
        </AuthGuard>
    );
}
