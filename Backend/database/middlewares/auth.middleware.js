const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ erreur: 'Token manquant. Connexion requise.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ erreur: 'Token invalide ou expiré.' });
        }
        req.utilisateur = decoded; 
        next();
    });
}

function roleMiddleware(rolesAutorises) {
    return (req, res, next) => {
        if (!req.utilisateur || !rolesAutorises.includes(req.utilisateur.role)) {
            return res.status(403).json({ erreur: 'Accès refusé pour votre rôle.' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware };