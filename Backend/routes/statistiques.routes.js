const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { getStatistiques, getAdherentPlusActif } = require('../controllers/statistiques.controller');

router.get(
  '/',
  authMiddleware,
  roleMiddleware('personnel'),
  getStatistiques
);

router.get(
  '/adherent-plus-actif',
  authMiddleware,
  roleMiddleware('personnel'),
  getAdherentPlusActif
);

module.exports = router;