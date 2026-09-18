const API_URL = 'http://localhost:3000';

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const estFormData = options.body instanceof FormData;

    const headers = {
        ...(!estFormData && { 'Content-Type': 'application/json' }),
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Si le token est expiré ou invalide, on déconnecte proprement l'utilisateur
    if (response.status === 401 || response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.erreur && (data.erreur.includes('Token') || data.erreur.includes('token'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('utilisateur');
            window.location.href = 'connexion.html';
            return;
        }
        throw new Error(data.erreur || 'Accès refusé.');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.erreur || 'Une erreur est survenue.');
    }

    return data;
}