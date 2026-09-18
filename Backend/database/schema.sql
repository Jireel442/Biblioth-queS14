CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('personnel', 'adherent')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur_id INTEGER NOT NULL REFERENCES auteurs(id) ON DELETE RESTRICT,
    annee_publication INTEGER,
    statut VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'emprunte')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emprunts (
    id SERIAL PRIMARY KEY,
    livre_id INTEGER NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    date_emprunt TIMESTAMP NOT NULL DEFAULT NOW(),
    date_retour_prevue DATE NOT NULL,
    date_retour_effective TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_livres_auteur ON livres(auteur_id);
CREATE INDEX idx_emprunts_livre ON emprunts(livre_id);
CREATE INDEX idx_emprunts_adherent ON emprunts(adherent_id);
CREATE INDEX idx_livres_titre ON livres(titre);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
ALTER TABLE livres ADD COLUMN fichier_pdf VARCHAR(255);