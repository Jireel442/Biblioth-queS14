const formInscription = document.getElementById('formInscription');
const messageEl = document.getElementById('message');

const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
if (!utilisateur || utilisateur.role !== 'personnel') {
    messageEl.style.color = '#6E2E33';
    messageEl.textContent = 'L’ajout d’adhérents est réservé au personnel.';
    formInscription.style.display = 'none';
} else {
    formInscription.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';

        const nom = document.getElementById('nom').value;
        const prenom = document.getElementById('prenom').value;
        const email = document.getElementById('email').value;
        const mot_de_passe = document.getElementById('mot_de_passe').value;

        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ nom, prenom, email, mot_de_passe })
            });

            messageEl.style.color = 'green';
            messageEl.textContent = 'Compte adhérent créé ! Redirection vers la liste...';

            setTimeout(() => {
                window.location.href = 'adherents.html';
            }, 1500);

        } catch (err) {
            messageEl.style.color = 'red';
            messageEl.textContent = err.message;
        }
    });
}