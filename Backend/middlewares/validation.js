// Génère un middleware qui vérifie que tous les champs listés sont présents et non vides
function validerChampsRequis(champs) {
    return (req, res, next) => {
        const champsManquants = champs.filter(champ => {
            const valeur = req.body[champ];
            return valeur === undefined || valeur === null || valeur === '';
        });

        if (champsManquants.length > 0) {
            return res.status(400).json({
                erreur: `Champ(s) manquant(s) : ${champsManquants.join(', ')}.`
            });
        }

        next();
    };
}

// Vérifie qu'un email a un format valide
function validerEmail(req, res, next) {
    const { email } = req.body;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !regexEmail.test(email)) {
        return res.status(400).json({ erreur: "Format d'email invalide." });
    }
    next();
}

module.exports = { validerChampsRequis, validerEmail };