const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API URL:' + API_URL);

let refreshPromise = null;

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        const err = new Error('Sem refresh token disponível');
        err.status = 401; // sem token = sessão realmente inexistente
        throw err;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        const err = new Error('Refresh falhou');
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
}

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
        let newToken;
        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }
            newToken = await refreshPromise;
        } catch (err) {
            // Só desloga se o servidor REJEITOU o token (401/403).
            // Falha de rede, servidor fora (5xx), timeout etc. são temporários:
            // mantém a sessão e deixa a próxima tentativa resolver.
            const isAuthRejection = err.status === 401 || err.status === 403;
            if (!isAuthRejection) {
                console.warn('[auth] Refresh falhou por erro temporário (sessão mantida):', err.message, 'status:', err.status, 'online:', navigator.onLine);
                throw new Error('Sem conexão com o servidor');
            }
            console.error('[auth] Sessão encerrada — refresh rejeitado:', err.message, 'path:', path, 'at:', new Date().toISOString());
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Sessão expirada');
        }

        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
        });

        if (!retryResponse.ok) {
            const errorBody = await retryResponse.json().catch(() => ({}));
            const retryError = new Error(errorBody.message || 'Erro na requisição');
            if (errorBody.code) retryError.code = errorBody.code;
            throw retryError;
        }

        const retryText = await retryResponse.text();
        return retryText ? JSON.parse(retryText) : null;
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.message || 'Erro na requisição';
        const error = new Error(message);
        if (errorBody.code) error.code = errorBody.code;
        throw error;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}