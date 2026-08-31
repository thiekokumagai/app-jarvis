const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jarvis_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    const refreshToken = localStorage.getItem('jarvis_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('jarvis_token', data.accessToken);
          localStorage.setItem('jarvis_refresh_token', data.refreshToken);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
        }
      } catch (e) {
        console.error('Refresh token error', e);
      }
    }
    localStorage.removeItem('jarvis_token');
    localStorage.removeItem('jarvis_refresh_token');
    window.location.href = '/login';
  }

  return response;
}
