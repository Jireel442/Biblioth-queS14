const utilisateur = verifierConnexion();
let pageActuelle = 1;
const limiteParPage = 10;
let listeAuteurs = [];

if (utilisateur) {
    document.getElementById('nomUtilisateur').textContent =
        `${utilisateur.prenom} (${utilisateur.role})`;

    if (utilisateur.role === 'adherent') {
        document.getElementById('lienAdherents').style.display = 'none';
        document.getElementById('formAjoutLivre').style.display = 'none';
        document.getElementById('colActions').style.display = 'none';
    } else {
        remplirListeAuteurs();
    }

    document.getElementById('rechercheTitre').addEventListener('input', () => {
        pageActuelle = 1;
        chargerLivres();
    });
    document.getElementById('rechercheAuteur').addEventListener('input', () => {
        pageActuelle = 1;
        chargerLivres();
    });

    chargerLivres();
}

function reinitialiserRecherche() {
    document.getElementById('rechercheTitre').value = '';
    document.getElementById('rechercheAuteur').value = '';
    pageActuelle = 1;
    chargerLivres();
}

async function remplirListeAuteurs() {
    const select = document.getElementById('auteur_id');
    try {
        listeAuteurs = await apiFetch('/auteurs');
        listeAuteurs.forEach(auteur => {
            const option = document.createElement('option');
            option.value = auteur.id;
            option.textContent = `${auteur.prenom} ${auteur.nom}`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Impossible de charger les auteurs :', err.message);
    }
}

async function chargerLivres() {
    const corps = document.getElementById('corpsTableauLivres');
    const titre = document.getElementById('rechercheTitre').value;
    const auteur = document.getElementById('rechercheAuteur').value;

    const params = new URLSearchParams({ page: pageActuelle, limit: limiteParPage });
    if (titre) params.append('titre', titre);
    if (auteur) params.append('auteur', auteur);

    try {
        const data = await apiFetch(`/livres?${params.toString()}`);
        corps.innerHTML = '';

        if (data.livres.length === 0) {
            corps.innerHTML = '<tr><td colspan="6">Aucun livre trouvé.</td></tr>';
        }

        data.livres.forEach(livre => {
            const pdfUrl = livre.fichier_pdf ? `${API_URL}/uploads/${encodeURIComponent(livre.fichier_pdf)}` : null;
            const ligne = document.createElement('tr');
            ligne.innerHTML = `
                <td>${livre.titre}</td>
                <td>${livre.auteur_prenom} ${livre.auteur_nom}</td>
                <td>${livre.annee_publication || '—'}</td>
                <td><span class="statut-${livre.statut}">${livre.statut === 'disponible' ? 'Disponible' : 'Emprunté'}</span></td>
                <td>
                    ${pdfUrl ? `<a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Ouvrir PDF</a>` : '—'}
                </td>
                <td>
                    ${utilisateur.role === 'personnel' ? `
                        <button onclick="modifierLivre(${livre.id}, '${livre.titre.replace(/'/g, "\\'")}', ${livre.auteur_id}, ${livre.annee_publication || 'null'})">Modifier</button>
                        <button onclick="supprimerLivre(${livre.id})" class="bouton-danger">Supprimer</button>
                    ` : ''}
                </td>
            `;
            corps.appendChild(ligne);
        });

        const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
        document.getElementById('infoPagination').textContent = `Page ${data.page} / ${totalPages}`;
        document.getElementById('pagePrecedente').disabled = data.page <= 1;
        document.getElementById('pageSuivante').disabled = data.page >= totalPages;

    } catch (err) {
        corps.innerHTML = `<tr><td colspan="5">Erreur : ${err.message}</td></tr>`;
    }
}

function changerPage(delta) {
    pageActuelle += delta;
    chargerLivres();
}

document.getElementById('formAjoutLivre').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('messageLivre');
    messageEl.textContent = '';

    const titre = document.getElementById('titre').value;
    const auteur_id = document.getElementById('auteur_id').value;
    const annee_publication = document.getElementById('annee_publication').value;
    const fichierPdf = document.getElementById('fichier_pdf').files[0];

    try {
        const formData = new FormData();
        formData.append('titre', titre);
        formData.append('auteur_id', auteur_id);
        formData.append('annee_publication', annee_publication || '');
        if (fichierPdf) {
            formData.append('fichier_pdf', fichierPdf);
        }

        await apiFetch('/livres', {
            method: 'POST',
            body: formData
        });

        document.getElementById('formAjoutLivre').reset();
        messageEl.style.color = '#4B6355';
        messageEl.textContent = 'Livre ajouté avec succès.';
        chargerLivres();
    } catch (err) {
        messageEl.style.color = '#6E2E33';
        messageEl.textContent = err.message;
    }
});

async function modifierLivre(id, titreActuel, auteurIdActuel, anneeActuelle) {
    const nouveauTitre = prompt('Nouveau titre :', titreActuel);
    if (nouveauTitre === null) return;

    const nomsAuteurs = listeAuteurs.map(a => `${a.id} = ${a.prenom} ${a.nom}`).join('\n');
    const nouvelAuteurId = prompt(`ID du nouvel auteur :\n${nomsAuteurs}`, auteurIdActuel);
    if (nouvelAuteurId === null) return;

    const nouvelleAnnee = prompt('Nouvelle année :', anneeActuelle || '');
    if (nouvelleAnnee === null) return;

    try {
        await apiFetch(`/livres/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                titre: nouveauTitre,
                auteur_id: nouvelAuteurId,
                annee_publication: nouvelleAnnee || null
            })
        });
        chargerLivres();
    } catch (err) {
        alert(err.message);
    }
}

async function supprimerLivre(id) {
    if (!confirm('Supprimer ce livre ?')) return;
    try {
        await apiFetch(`/livres/${id}`, { method: 'DELETE' });
        chargerLivres();
    } catch (err) {
        alert(err.message);
    }
}