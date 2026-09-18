const pool = require('../config/db');

// GET /auteurs
async function getAllAuteurs(req, res, next) {
    try {
        const result = await pool.query('SELECT * FROM auteurs ORDER BY nom, prenom');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

// GET /auteurs/:id
async function getAuteurById(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM auteurs WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Auteur introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

// POST /auteurs
async function createAuteur(req, res, next) {
    try {
        const { nom, prenom, nationalite } = req.body;

        if (!nom || !prenom) {
            return res.status(400).json({ erreur: 'Le nom et le prénom sont requis.' });
        }

        const result = await pool.query(
            'INSERT INTO auteurs (nom, prenom, nationalite) VALUES ($1, $2, $3) RETURNING *',
            [nom, prenom, nationalite || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

// PUT /auteurs/:id
async function updateAuteur(req, res, next) {
    try {
        const { id } = req.params;
        const { nom, prenom, nationalite } = req.body;

        if (!nom || !prenom) {
            return res.status(400).json({ erreur: 'Le nom et le prénom sont requis.' });
        }

        const result = await pool.query(
            'UPDATE auteurs SET nom = $1, prenom = $2, nationalite = $3 WHERE id = $4 RETURNING *',
            [nom, prenom, nationalite || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Auteur introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

// DELETE /auteurs/:id
async function deleteAuteur(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM auteurs WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Auteur introuvable.' });
        }
        res.json({ message: 'Auteur supprimé avec succès.' });
    } catch (err) {
        // Si l'auteur a des livres liés, la contrainte ON DELETE RESTRICT bloque la suppression
        if (err.code === '23503') {
            return res.status(409).json({ erreur: 'Impossible de supprimer : cet auteur a des livres associés.' });
        }
        next(err);
    }
}

module.exports = { getAllAuteurs, getAuteurById, createAuteur, updateAuteur, deleteAuteur };