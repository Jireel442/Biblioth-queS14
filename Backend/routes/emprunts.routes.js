const express = require('express');
const router = express.Router();
const {
    getAllEmprunts,
    getEmpruntsParAdherent,
    creerEmprunt,
    retournerEmprunt
} = require('../controllers/emprunts.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { validerChampsRequis } = require('../middlewares/validation');

router.get('/', authMiddleware, roleMiddleware(['personnel']), getAllEmprunts);
router.get('/adherent/:id', authMiddleware, getEmpruntsParAdherent);
router.post('/', authMiddleware, roleMiddleware(['personnel']), validerChampsRequis(['livre_id', 'adherent_id', 'date_retour_prevue']), creerEmprunt);
router.put('/:id/retour', authMiddleware, roleMiddleware(['personnel']), retournerEmprunt);

module.exports = router;