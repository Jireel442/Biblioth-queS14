// Vérifie qu'un utilisateur est connecté, sinon redirige vers la page de connexion
function verifierConnexion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'connexion.html';
        return null;
    }

    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
    if (!utilisateur) {
        localStorage.removeItem('token');
        window.location.href = 'connexion.html';
        return null;
    }

    return utilisateur;
}

// Déconnexion : supprime le token et redirige
function deconnexion() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    window.location.href = 'connexion.html';
}

const utilisateurConnecte = verifierConnexion();
if (utilisateurConnecte && utilisateurConnecte.role !== 'personnel') {
    window.location.href = 'index.html';
}