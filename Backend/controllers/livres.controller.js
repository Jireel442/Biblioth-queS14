const pool = require('../config/db');

async function getAllLivres(req, res, next) {
    try {
        const { titre, auteur, page = 1, limit = 10 } = req.query;
        const conditions = [];
        const valeurs = [];
        let index = 1;

        if (titre) {
            conditions.push(`livres.titre ILIKE $${index}`);
            valeurs.push(`%${titre}%`);
            index++;
        }
        if (auteur) {
            conditions.push(`(auteurs.nom ILIKE $${index} OR auteurs.prenom ILIKE $${index})`);
            valeurs.push(`%${auteur}%`);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        const requeteLivres = `
            SELECT livres.id, livres.titre, livres.annee_publication, livres.statut, livres.auteur_id, livres.fichier_pdf,
                   auteurs.nom AS auteur_nom, auteurs.prenom AS auteur_prenom
            FROM livres
            JOIN auteurs ON livres.auteur_id = auteurs.id
            ${whereClause}
            ORDER BY livres.titre
            LIMIT $${index} OFFSET $${index + 1}
        `;
        const valeursLivres = [...valeurs, limit, offset];

        const requeteTotal = `
            SELECT COUNT(*) FROM livres
            JOIN auteurs ON livres.auteur_id = auteurs.id
            ${whereClause}
        `;

        const [resultLivres, resultTotal] = await Promise.all([
            pool.query(requeteLivres, valeursLivres),
            pool.query(requeteTotal, valeurs)
        ]);

        res.json({
            livres: resultLivres.rows,
            total: parseInt(resultTotal.rows[0].count, 10),
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        });
    } catch (err) {
        next(err);
    }
}

async function createLivre(req, res, next) {
    try {
        const { titre, auteur_id, annee_publication } = req.body;

        if (!titre || !auteur_id) {
            return res.status(400).json({ erreur: "Le titre et l'auteur sont requis." });
        }

        const fichierPdf = req.file ? req.file.filename : null;

        const result = await pool.query(
            `INSERT INTO livres (titre, auteur_id, annee_publication, fichier_pdf)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [titre, auteur_id, annee_publication || null, fichierPdf]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ erreur: 'Auteur introuvable.' });
        }
        next(err);
    }
}

async function updateLivre(req, res, next) {
    try {
        const { id } = req.params;
        const { titre, auteur_id, annee_publication } = req.body;

        if (!titre || !auteur_id) {
            return res.status(400).json({ erreur: "Le titre et l'auteur sont requis." });
        }

        const result = await pool.query(
            `UPDATE livres SET titre = $1, auteur_id = $2, annee_publication = $3
             WHERE id = $4 RETURNING *`,
            [titre, auteur_id, annee_publication || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Livre introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ erreur: 'Auteur introuvable.' });
        }
        next(err);
    }
}

async function deleteLivre(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM livres WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Livre introuvable.' });
        }
        res.json({ message: 'Livre supprimé avec succès.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllLivres, createLivre, updateLivre, deleteLivre };