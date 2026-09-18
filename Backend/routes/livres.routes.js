const express = require('express');
const router = express.Router();
const { getAllLivres, createLivre, updateLivre, deleteLivre } = require('../controllers/livres.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getAllLivres);
router.post('/', authMiddleware, roleMiddleware(['personnel']), createLivre);
router.put('/:id', authMiddleware, roleMiddleware(['personnel']), updateLivre);
router.delete('/:id', authMiddleware, roleMiddleware(['personnel']), deleteLivre);

module.exports = router;