const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Inscription
async function register(req, res, next) {
    try {
        if (!req.utilisateur || req.utilisateur.role !== 'personnel') {
            return res.status(403).json({ erreur: 'Seul le personnel peut créer un compte adhérent.' });
        }

        const { nom, prenom, email, mot_de_passe } = req.body;

        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({ erreur: 'Tous les champs sont requis.' });
        }

        const emailExistant = await pool.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
        if (emailExistant.rows.length > 0) {
            return res.status(409).json({ erreur: 'Cet email est déjà utilisé.' });
        }

        const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);

        const result = await pool.query(
            `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, role)
             VALUES ($1, $2, $3, $4, 'adherent') RETURNING id, nom, prenom, email, role`,
            [nom, prenom, email, mot_de_passe_hash]
        );

        const utilisateur = result.rows[0];

        await pool.query(
            'INSERT INTO adherents (utilisateur_id) VALUES ($1)',
            [utilisateur.id]
        );

        res.status(201).json({ message: 'Compte adhérent créé avec succès.', utilisateur });
    } catch (err) {
        next(err);
    }
}

// Connexion
async function login(req, res, next) {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).json({ erreur: 'Email et mot de passe requis.' });
        }

        const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });
        }

        const utilisateur = result.rows[0];
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe_hash);

        if (!motDePasseValide) {
            return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });
        }

        if (utilisateur.role !== 'personnel') {
            return res.status(403).json({ erreur: 'Accès réservé au personnel.' });
        }

        const token = jwt.sign(
            { id: utilisateur.id, role: utilisateur.role, email: utilisateur.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Connexion réussie.',
            token,
            utilisateur: { id: utilisateur.id, nom: utilisateur.nom, prenom: utilisateur.prenom, role: utilisateur.role }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login };