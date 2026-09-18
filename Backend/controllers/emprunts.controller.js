const pool = require('../config/db');

// GET /emprunts?statut=en_cours|en_retard
async function getAllEmprunts(req, res, next) {
    try {
        const { statut } = req.query;

        let condition = '';
        if (statut === 'en_cours') {
            condition = 'WHERE emprunts.date_retour_effective IS NULL';
        } else if (statut === 'en_retard') {
            condition = `WHERE emprunts.date_retour_effective IS NULL
                          AND emprunts.date_retour_prevue < CURRENT_DATE`;
        }

        const result = await pool.query(`
            SELECT emprunts.id, emprunts.date_emprunt, emprunts.date_retour_prevue, emprunts.date_retour_effective,
                   livres.id AS livre_id, livres.titre AS livre_titre,
                   utilisateurs.nom AS adherent_nom, utilisateurs.prenom AS adherent_prenom,
                   adherents.id AS adherent_id,
                   (emprunts.date_retour_effective IS NULL AND emprunts.date_retour_prevue < CURRENT_DATE) AS en_retard
            FROM emprunts
            JOIN livres ON emprunts.livre_id = livres.id
            JOIN adherents ON emprunts.adherent_id = adherents.id
            JOIN utilisateurs ON adherents.utilisateur_id = utilisateurs.id
            ${condition}
            ORDER BY emprunts.date_emprunt DESC
        `);

        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

// GET /emprunts/adherent/:id — historique d'un adhérent donné
async function getEmpruntsParAdherent(req, res, next) {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT emprunts.id, emprunts.date_emprunt, emprunts.date_retour_prevue, emprunts.date_retour_effective,
                   livres.titre AS livre_titre,
                   (emprunts.date_retour_effective IS NULL AND emprunts.date_retour_prevue < CURRENT_DATE) AS en_retard
            FROM emprunts
            JOIN livres ON emprunts.livre_id = livres.id
            WHERE emprunts.adherent_id = $1
            ORDER BY emprunts.date_emprunt DESC
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

// POST /emprunts — créer un emprunt
async function creerEmprunt(req, res, next) {
    try {
        const { livre_id, adherent_id, date_retour_prevue } = req.body;

        if (!livre_id || !adherent_id || !date_retour_prevue) {
            return res.status(400).json({ erreur: 'livre_id, adherent_id et date_retour_prevue sont requis.' });
        }

        // Vérifie que le livre existe et est disponible
        const livre = await pool.query('SELECT statut FROM livres WHERE id = $1', [livre_id]);

        if (livre.rows.length === 0) {
            return res.status(404).json({ erreur: 'Livre introuvable.' });
        }
        if (livre.rows[0].statut === 'emprunte') {
            return res.status(400).json({ erreur: 'Ce livre est déjà emprunté.' });
        }

        // Transaction : créer l'emprunt ET passer le livre à "emprunte" ensemble
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resultEmprunt = await client.query(
                `INSERT INTO emprunts (livre_id, adherent_id, date_retour_prevue)
                 VALUES ($1, $2, $3) RETURNING *`,
                [livre_id, adherent_id, date_retour_prevue]
            );

            await client.query(
                `UPDATE livres SET statut = 'emprunte' WHERE id = $1`,
                [livre_id]
            );

            await client.query('COMMIT');
            res.status(201).json(resultEmprunt.rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ erreur: 'Livre ou adhérent introuvable.' });
        }
        next(err);
    }
}

// PUT /emprunts/:id/retour — enregistrer le retour d'un livre
async function retournerEmprunt(req, res, next) {
    try {
        const { id } = req.params;

        const emprunt = await pool.query('SELECT * FROM emprunts WHERE id = $1', [id]);
        if (emprunt.rows.length === 0) {
            return res.status(404).json({ erreur: 'Emprunt introuvable.' });
        }
        if (emprunt.rows[0].date_retour_effective !== null) {
            return res.status(400).json({ erreur: 'Ce livre a déjà été rendu.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resultRetour = await client.query(
                `UPDATE emprunts SET date_retour_effective = NOW() WHERE id = $1 RETURNING *`,
                [id]
            );

            await client.query(
                `UPDATE livres SET statut = 'disponible' WHERE id = $1`,
                [emprunt.rows[0].livre_id]
            );

            await client.query('COMMIT');
            res.json(resultRetour.rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllEmprunts, getEmpruntsParAdherent, creerEmprunt, retournerEmprunt };