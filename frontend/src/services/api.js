const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API URL:' + API_URL);

let refreshPromise = null;

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('Sem refresh token disponível');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Refresh falhou');
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
        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }
            const newToken = await refreshPromise;

            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_URL}${path}`, {
                ...options,
                headers,
            });

            if (!retryResponse.ok) {
                const errorBody = await retryResponse.json().catch(() => ({}));
                throw new Error(errorBody.error || 'Erro na requisição');
            }

            const retryText = await retryResponse.text();
            return retryText ? JSON.parse(retryText) : null;
        } catch {
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Sessão expirada');
        }
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.error || 'Erro na requisição';
        throw new Error(message);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}