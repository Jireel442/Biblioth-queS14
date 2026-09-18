const express = require('express');
const router = express.Router();
const {
    getAllAuteurs,
    getAuteurById,
    createAuteur,
    updateAuteur,
    deleteAuteur
} = require('../controllers/auteurs.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

// Consultation : accessible à tout utilisateur connecté (personnel ou adhérent)
router.get('/', authMiddleware, getAllAuteurs);
router.get('/:id', authMiddleware, getAuteurById);

// Modification : réservée au personnel
router.post('/', authMiddleware, roleMiddleware(['personnel']), createAuteur);
router.put('/:id', authMiddleware, roleMiddleware(['personnel']), updateAuteur);
router.delete('/:id', authMiddleware, roleMiddleware(['personnel']), deleteAuteur);

module.exports = router;