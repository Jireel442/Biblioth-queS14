const utilisateur = verifierConnexion();

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    if (utilisateur.role === 'adherent') {
        document.getElementById('lienAdherents').style.display = 'none';
        document.getElementById('formAjoutAuteur').style.display = 'none';
    }

    chargerAuteurs();
}

async function chargerAuteurs() {
    const corps = document.getElementById('corpsTableauAuteurs');
    try {
        const auteurs = await apiFetch('/auteurs');
        corps.innerHTML = '';

        if (auteurs.length === 0) {
            corps.innerHTML = '<tr><td colspan="4">Aucun auteur enregistré.</td></tr>';
            return;
        }

        auteurs.forEach(auteur => {
            const ligne = document.createElement('tr');
            ligne.innerHTML = `
                <td>${auteur.nom}</td>
                <td>${auteur.prenom}</td>
                <td>${auteur.nationalite || '—'}</td>
                <td>
                    ${utilisateur.role === 'personnel'
                        ? `<button onclick="supprimerAuteur(${auteur.id})" class="bouton-danger">Supprimer</button>`
                        : ''}
                </td>
            `;
            corps.appendChild(ligne);
        });
    } catch (err) {
        corps.innerHTML = `<tr><td colspan="4">Erreur : ${err.message}</td></tr>`;
    }
}

document.getElementById('formAjoutAuteur').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('messageAuteur');
    messageEl.textContent = '';

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const nationalite = document.getElementById('nationalite').value;

    try {
        await apiFetch('/auteurs', {
            method: 'POST',
            body: JSON.stringify({ nom, prenom, nationalite })
        });

        document.getElementById('formAjoutAuteur').reset();
        messageEl.style.color = '#4B6355';
        messageEl.textContent = 'Auteur ajouté avec succès.';
        chargerAuteurs();
    } catch (err) {
        messageEl.style.color = '#6E2E33';
        messageEl.textContent = err.message;
    }
});

async function supprimerAuteur(id) {
    if (!confirm('Supprimer cet auteur ?')) return;
    try {
        await apiFetch(`/auteurs/${id}`, { method: 'DELETE' });
        chargerAuteurs();
    } catch (err) {
        alert(err.message);
    }
}