const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API URL:' + API_URL);

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

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.error || 'Erro na requisição';
        throw new Error(message);
    }

    return response.json();
}