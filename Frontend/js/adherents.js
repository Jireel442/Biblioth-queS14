const utilisateur = verifierConnexion();

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    // Cette page est réservée au personnel — un adhérent ne devrait pas y accéder
    if (utilisateur.role === 'adherent') {
        window.location.href = 'index.html';
    } else {
        chargerAdherents();
    }
}

async function chargerAdherents() {
    const corps = document.getElementById('corpsTableauAdherents');
    try {
        const adherents = await apiFetch('/adherents');
        corps.innerHTML = '';

        if (adherents.length === 0) {
            corps.innerHTML = '<tr><td colspan="4">Aucun adhérent enregistré.</td></tr>';
            return;
        }

        adherents.forEach(adherent => {
            const ligne = document.createElement('tr');
            ligne.innerHTML = `
                <td>${adherent.nom}</td>
                <td>${adherent.prenom}</td>
                <td>${adherent.email}</td>
                <td>
                    <button onclick="voirHistorique(${adherent.id}, '${adherent.prenom} ${adherent.nom}')">Historique</button>
                    <button onclick="modifierAdherent(${adherent.id}, '${adherent.nom}', '${adherent.prenom}', '${adherent.email}')">Modifier</button>
                    <button onclick="supprimerAdherent(${adherent.id})" class="bouton-danger">Supprimer</button>
                </td>
            `;
            corps.appendChild(ligne);
        });
    } catch (err) {
        corps.innerHTML = `<tr><td colspan="4">Erreur : ${err.message}</td></tr>`;
    }
}

document.getElementById('formAjoutAdherent').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('messageAdherent');
    messageEl.textContent = '';

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;

    try {
        await apiFetch('/adherents', {
            method: 'POST',
            body: JSON.stringify({ nom, prenom, email, mot_de_passe })
        });

        document.getElementById('formAjoutAdherent').reset();
        messageEl.style.color = '#4B6355';
        messageEl.textContent = 'Adhérent ajouté avec succès.';
        chargerAdherents();
    } catch (err) {
        messageEl.style.color = '#6E2E33';
        messageEl.textContent = err.message;
    }
});

async function modifierAdherent(id, nomActuel, prenomActuel, emailActuel) {
    const nouveauNom = prompt('Nouveau nom :', nomActuel);
    if (nouveauNom === null) return;

    const nouveauPrenom = prompt('Nouveau prénom :', prenomActuel);
    if (nouveauPrenom === null) return;

    const nouvelEmail = prompt('Nouvel email :', emailActuel);
    if (nouvelEmail === null) return;

    try {
        await apiFetch(`/adherents/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nom: nouveauNom, prenom: nouveauPrenom, email: nouvelEmail })
        });
        chargerAdherents();
    } catch (err) {
        alert(err.message);
    }
}

async function supprimerAdherent(id) {
    if (!confirm('Supprimer cet adhérent ? Son historique d\'emprunts sera aussi supprimé.')) return;
    try {
        await apiFetch(`/adherents/${id}`, { method: 'DELETE' });
        chargerAdherents();
    } catch (err) {
        alert(err.message);
    }
}

async function voirHistorique(id, nomComplet) {
    const panneau = document.getElementById('panneauHistorique');
    const corps = document.getElementById('corpsHistorique');

    document.getElementById('nomAdherentHistorique').textContent = nomComplet;
    panneau.style.display = 'block';
    corps.innerHTML = '<tr><td colspan="4">Chargement...</td></tr>';

    try {
        const historique = await apiFetch(`/emprunts/adherent/${id}`);
        corps.innerHTML = '';

        if (historique.length === 0) {
            corps.innerHTML = '<tr><td colspan="4">Aucun emprunt pour cet adhérent.</td></tr>';
            return;
        }

        historique.forEach(emprunt => {
            const statutTexte = emprunt.date_retour_effective
                ? 'Rendu'
                : emprunt.en_retard ? 'En retard' : 'En cours';

            const ligne = document.createElement('tr');
            ligne.innerHTML = `
                <td>${emprunt.livre_titre}</td>
                <td>${new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}</td>
                <td>${new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge-${emprunt.date_retour_effective ? 'rendu' : emprunt.en_retard ? 'retard' : 'encours'}">${statutTexte}</span></td>
            `;
            corps.appendChild(ligne);
        });
    } catch (err) {
        corps.innerHTML = `<tr><td colspan="4">Erreur : ${err.message}</td></tr>`;
    }
}

function fermerHistorique() {
    document.getElementById('panneauHistorique').style.display = 'none';
}