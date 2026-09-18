
livre.statut est contraint à seulement deux valeurs (disponible / emprunte) grâce à un CHECK.
Un emprunt "en retard" se déduit en comparant date_retour_prevue à aujourd'hui, tant que date_retour_reelle est vide (NULL) — pas besoin d'une colonne "retard" séparée.
ON DELETE CASCADE supprime automatiquement les emprunts liés si un livre ou un adhérent est supprimé (à discuter selon ce que tu veux vraiment côté métier — tu peux aussi mettre RESTRICT si tu préfères empêcher la suppression).

Dis-moi quand les tables sont créées, on passera à db.js et au serveur Express.