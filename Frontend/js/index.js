const utilisateur = verifierConnexion();

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    if (utilisateur.role === 'adherent') {
        document.getElementById('lienAdherents').style.display = 'none';
    }

    chargerLivres();
}

const couleursTranches = ['#A9793B', '#6E2E33', '#4B6355'];

async function chargerLivres() {
    const grille = document.getElementById('grilleLivres');
    const message = document.getElementById('messageLivres');

    try {
        const data = await apiFetch('/livres?limit=8');
        const livres = data.livres;

        if (livres.length === 0) {
            message.textContent = 'Aucun livre enregistré pour le moment.';
            return;
        }

        message.remove();

        livres.forEach((livre, index) => {
            const carte = document.createElement('div');
            carte.className = 'carte-livre';
            carte.style.borderLeftColor = couleursTranches[index % couleursTranches.length];

            carte.innerHTML = `
                <h3>${livre.titre}</h3>
                <p class="auteur-livre">${livre.auteur_prenom} ${livre.auteur_nom}</p>
                <p class="meta-livre">
                    ${livre.annee_publication || '—'}
                    <span class="statut-${livre.statut}">${livre.statut === 'disponible' ? 'Disponible' : 'Emprunté'}</span>
                </p>
            `;
            grille.appendChild(carte);
        });
    } catch (err) {
        message.textContent = 'Impossible de charger les livres : ' + err.message;
    }
}