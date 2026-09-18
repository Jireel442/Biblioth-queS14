const utilisateur = verifierConnexion();
let filtreActuel = 'tous';

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    if (utilisateur.role === 'adherent') {
        document.getElementById('lienAdherents').style.display = 'none';
        document.getElementById('formNouvelEmprunt').style.display = 'none';
    } else {
        remplirListesDeroulantes();
    }

    chargerEmprunts();
}

async function remplirListesDeroulantes() {
    try {
        const [data, adherents] = await Promise.all([
            apiFetch('/livres?limit=100'),
            apiFetch('/adherents')
        ]);

        const selectLivre = document.getElementById('livre_id');
        data.livres
            .filter(livre => livre.statut === 'disponible')
            .forEach(livre => {
                const option = document.createElement('option');
                option.value = livre.id;
                option.textContent = livre.titre;
                selectLivre.appendChild(option);
            });

        const selectAdherent = document.getElementById('adherent_id');
        adherents.forEach(adherent => {
            const option = document.createElement('option');
            option.value = adherent.id;
            option.textContent = `${adherent.prenom} ${adherent.nom}`;
            selectAdherent.appendChild(option);
        });
    } catch (err) {
        console.error('Erreur de chargement des listes :', err.message);
    }
}

function filtrerEmprunts(filtre) {
    filtreActuel = filtre;
    document.querySelectorAll('.filtres-emprunts button').forEach(b => b.classList.remove('filtre-actif'));
    document.getElementById(
        filtre === 'tous' ? 'filtreTous' : filtre === 'en_cours' ? 'filtreEnCours' : 'filtreEnRetard'
    ).classList.add('filtre-actif');
    chargerEmprunts();
}

async function chargerEmprunts() {
    const corps = document.getElementById('corpsTableauEmprunts');
    try {
        const params = filtreActuel !== 'tous' ? `?statut=${filtreActuel}` : '';
        const emprunts = await apiFetch(`/emprunts${params}`);

        corps.innerHTML = '';

        if (emprunts.length === 0) {
            corps.innerHTML = '<tr><td colspan="6">Aucun emprunt trouvé.</td></tr>';
            return;
        }

        emprunts.forEach(emprunt => {
            const ligne = document.createElement('tr');
            if (emprunt.en_retard) {
                ligne.classList.add('ligne-en-retard');
            }

            const statutTexte = emprunt.date_retour_effective
                ? 'Rendu'
                : emprunt.en_retard
                    ? 'En retard'
                    : 'En cours';

            ligne.innerHTML = `
                <td>${emprunt.livre_titre}</td>
                <td>${emprunt.adherent_prenom} ${emprunt.adherent_nom}</td>
                <td>${new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}</td>
                <td>${new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge-${emprunt.date_retour_effective ? 'rendu' : emprunt.en_retard ? 'retard' : 'encours'}">${statutTexte}</span></td>
                <td>
                    ${!emprunt.date_retour_effective && utilisateur.role === 'personnel'
                        ? `<button onclick="enregistrerRetour(${emprunt.id})">Marquer comme rendu</button>`
                        : '—'}
                </td>
            `;
            corps.appendChild(ligne);
        });
    } catch (err) {
        corps.innerHTML = `<tr><td colspan="6">Erreur : ${err.message}</td></tr>`;
    }
}

document.getElementById('formNouvelEmprunt').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('messageEmprunt');
    messageEl.textContent = '';

    const livre_id = document.getElementById('livre_id').value;
    const adherent_id = document.getElementById('adherent_id').value;
    const date_retour_prevue = document.getElementById('date_retour_prevue').value;

    try {
        await apiFetch('/emprunts', {
            method: 'POST',
            body: JSON.stringify({ livre_id, adherent_id, date_retour_prevue })
        });

        document.getElementById('formNouvelEmprunt').reset();
        messageEl.style.color = '#4B6355';
        messageEl.textContent = 'Emprunt enregistré avec succès.';
        chargerEmprunts();
        remplirListesDeroulantes(); // rafraîchit la liste des livres disponibles
    } catch (err) {
        messageEl.style.color = '#6E2E33';
        messageEl.textContent = err.message;
    }
});

async function enregistrerRetour(id) {
    if (!confirm('Confirmer le retour de ce livre ?')) return;
    try {
        await apiFetch(`/emprunts/${id}/retour`, { method: 'PUT' });
        chargerEmprunts();
    } catch (err) {
        alert(err.message);
    }
}