const express = require('express');
const router = express.Router();
const { getAllAdherents, createAdherent, updateAdherent, deleteAdherent } = require('../controllers/adherents.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validerChampsRequis, validerEmail } = require('../middlewares/validation');

router.get('/', authMiddleware, roleMiddleware(['personnel']), getAllAdherents);
router.post('/', authMiddleware, roleMiddleware(['personnel']), validerChampsRequis(['nom', 'prenom', 'email', 'mot_de_passe']), validerEmail, createAdherent);
router.put('/:id', authMiddleware, roleMiddleware(['personnel']), validerChampsRequis(['nom', 'prenom', 'email']), validerEmail, updateAdherent);
router.delete('/:id', authMiddleware, roleMiddleware(['personnel']), deleteAdherent);

module.exports = router;