const bcrypt = require('bcrypt');
const pool = require('../config/db');

// GET /adherents
async function getAllAdherents(req, res, next) {
    try {
        const result = await pool.query(`
            SELECT adherents.id, utilisateurs.nom, utilisateurs.prenom, utilisateurs.email
            FROM adherents
            JOIN utilisateurs ON adherents.utilisateur_id = utilisateurs.id
            ORDER BY utilisateurs.nom, utilisateurs.prenom
        `);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

// POST /adherents — crée le compte utilisateur ET la fiche adhérent liée
async function createAdherent(req, res, next) {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({ erreur: 'Tous les champs sont requis.' });
        }

        const emailExistant = await pool.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
        if (emailExistant.rows.length > 0) {
            return res.status(409).json({ erreur: 'Cet email est déjà utilisé.' });
        }

        const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resultUtilisateur = await client.query(
                `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, role)
                 VALUES ($1, $2, $3, $4, 'adherent') RETURNING id`,
                [nom, prenom, email, mot_de_passe_hash]
            );

            const resultAdherent = await client.query(
                `INSERT INTO adherents (utilisateur_id) VALUES ($1) RETURNING id`,
                [resultUtilisateur.rows[0].id]
            );

            await client.query('COMMIT');
            res.status(201).json({
                id: resultAdherent.rows[0].id,
                nom, prenom, email
            });
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

// PUT /adherents/:id — modifie nom/prénom/email (pas le mot de passe)
async function updateAdherent(req, res, next) {
    try {
        const { id } = req.params;
        const { nom, prenom, email } = req.body;

        if (!nom || !prenom || !email) {
            return res.status(400).json({ erreur: 'Nom, prénom et email sont requis.' });
        }

        const adherent = await pool.query('SELECT utilisateur_id FROM adherents WHERE id = $1', [id]);
        if (adherent.rows.length === 0) {
            return res.status(404).json({ erreur: 'Adhérent introuvable.' });
        }

        const result = await pool.query(
            `UPDATE utilisateurs SET nom = $1, prenom = $2, email = $3
             WHERE id = $4 RETURNING nom, prenom, email`,
            [nom, prenom, email, adherent.rows[0].utilisateur_id]
        );

        res.json({ id, ...result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erreur: 'Cet email est déjà utilisé.' });
        }
        next(err);
    }
}

// DELETE /adherents/:id — supprime le compte utilisateur (cascade vers adherents + emprunts)
async function deleteAdherent(req, res, next) {
    try {
        const { id } = req.params;

        const adherent = await pool.query('SELECT utilisateur_id FROM adherents WHERE id = $1', [id]);
        if (adherent.rows.length === 0) {
            return res.status(404).json({ erreur: 'Adhérent introuvable.' });
        }

        await pool.query('DELETE FROM utilisateurs WHERE id = $1', [adherent.rows[0].utilisateur_id]);
        res.json({ message: 'Adhérent supprimé avec succès.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllAdherents, createAdherent, updateAdherent, deleteAdherent };