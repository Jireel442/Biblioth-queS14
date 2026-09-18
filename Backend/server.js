require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const auteursRoutes = require('./routes/auteurs.routes');
const livresRoutes = require('./routes/livres.routes');
const errorHandler = require('./middlewares/errorHandler');
const adherentsRoutes = require('./routes/adherents.routes');
const empruntsRoutes = require('./routes/emprunts.routes');
const statistiquesRoutes = require('./routes/statistiques.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.get('/', (req, res) => {
 res.redirect('/pages/index.html');
});
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/auth', authRoutes);
app.use('/auteurs', auteursRoutes);
app.use('/livres', livresRoutes);
app.use('/adherents', adherentsRoutes);
app.use('/emprunts', empruntsRoutes);
app.use('/statistiques', statistiquesRoutes);


app.use(errorHandler); // toujours en dernier, après toutes les routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});