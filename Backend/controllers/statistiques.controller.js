const pool = require('../config/db');

const getStatistiques = async (req, res, next) => {
  try {
    const [totalLivresQuery, totalAdherentsQuery, empruntsEnCoursQuery, empruntsEnRetardQuery, livrePlusEmprunteQuery, adherentPlusActifQuery] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM livres'),
      pool.query('SELECT COUNT(*)::int AS total FROM adherents'),
      pool.query('SELECT COUNT(*)::int AS total FROM emprunts WHERE date_retour_effective IS NULL'),
      pool.query('SELECT COUNT(*)::int AS total FROM emprunts WHERE date_retour_effective IS NULL AND date_retour_prevue < CURRENT_DATE'),
      pool.query(`
        SELECT l.id, l.titre, COUNT(e.id)::int AS nombre_emprunts
        FROM emprunts e
        JOIN livres l ON l.id = e.livre_id
        GROUP BY l.id, l.titre
        ORDER BY nombre_emprunts DESC
        LIMIT 1
      `),
      pool.query(`
        SELECT u.id AS adherent_id, u.nom, u.prenom, COUNT(e.id)::int AS nombre_emprunts
        FROM emprunts e
        JOIN adherents a ON a.id = e.adherent_id
        JOIN utilisateurs u ON u.id = a.utilisateur_id
        GROUP BY u.id, u.nom, u.prenom
        ORDER BY nombre_emprunts DESC
        LIMIT 1
      `)
    ]);

    res.json({
      totalLivres: totalLivresQuery.rows[0]?.total ?? 0,
      totalAdherents: totalAdherentsQuery.rows[0]?.total ?? 0,
      empruntsEnCours: empruntsEnCoursQuery.rows[0]?.total ?? 0,
      empruntsEnRetard: empruntsEnRetardQuery.rows[0]?.total ?? 0,
      livrePlusEmprunte: livrePlusEmprunteQuery.rows[0] ?? null,
      adherentPlusActif: adherentPlusActifQuery.rows[0] ?? null,
    });
  } catch (err) {
    next(err);
  }
};

const getAdherentPlusActif = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS adherent_id,
        u.nom,
        u.prenom,
        COUNT(e.id)::int AS nombre_emprunts
      FROM emprunts e
      JOIN adherents a ON a.id = e.adherent_id
      JOIN utilisateurs u ON u.id = a.utilisateur_id
      GROUP BY u.id, u.nom, u.prenom
      ORDER BY nombre_emprunts DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucun emprunt enregistré' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStatistiques,
  getAdherentPlusActif,
};