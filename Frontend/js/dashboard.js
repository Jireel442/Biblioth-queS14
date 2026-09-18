const utilisateur = verifierConnexion();

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    // Le tableau de bord est réservé au personnel
    if (utilisateur.role === 'adherent') {
        window.location.href = 'index.html';
    } else {
        chargerStatistiques();
    }
}

async function chargerStatistiques() {
    const grille = document.getElementById('grilleStats');
    const message = document.getElementById('messageStats');

    try {
        const stats = await apiFetch('/statistiques');
        message.remove();

        const cartes = [
            { label: 'Livres au total', valeur: stats.totalLivres, couleur: '#A9793B' },
            { label: 'Adhérents inscrits', valeur: stats.totalAdherents, couleur: '#4B6355' },
            { label: 'Emprunts en cours', valeur: stats.empruntsEnCours, couleur: '#22302A' },
            { label: 'Emprunts en retard', valeur: stats.empruntsEnRetard, couleur: '#6E2E33' }
        ];

        cartes.forEach(carte => {
            const div = document.createElement('div');
            div.className = 'carte-stat';
            div.style.borderTopColor = carte.couleur;
            div.innerHTML = `
                <span class="valeur-stat" style="color: ${carte.couleur};">${carte.valeur}</span>
                <span class="label-stat">${carte.label}</span>
            `;
            grille.appendChild(div);
        });

        document.getElementById('livrePlusEmprunte').textContent = stats.livrePlusEmprunte
            ? `${stats.livrePlusEmprunte.titre} (${stats.livrePlusEmprunte.nombre_emprunts} emprunts)`
            : 'Aucune donnée pour le moment.';

        document.getElementById('adherentPlusActif').textContent = stats.adherentPlusActif
            ? `${stats.adherentPlusActif.prenom} ${stats.adherentPlusActif.nom} (${stats.adherentPlusActif.nombre_emprunts} emprunts)`
            : 'Aucune donnée pour le moment.';

    } catch (err) {
        message.textContent = 'Impossible de charger les statistiques : ' + err.message;
    }
}