const formConnexion = document.getElementById('formConnexion');
const messageEl = document.getElementById('message');

formConnexion.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';

    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, mot_de_passe })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));

        messageEl.style.color = 'green';
        messageEl.textContent = `Connecté en tant que ${data.utilisateur.prenom} (${data.utilisateur.role})`;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (err) {
        messageEl.style.color = 'red';
        messageEl.textContent = err.message;
    }
});