const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dossierUploads = path.join(__dirname, '../uploads');

// Crée le dossier uploads/ s'il n'existe pas
if (!fs.existsSync(dossierUploads)) {
    fs.mkdirSync(dossierUploads);
}

const stockage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dossierUploads),
    filename: (req, file, cb) => {
        const nomUnique = `${Date.now()}-${file.originalname}`;
        cb(null, nomUnique);
    }
});

function filtrePdf(req, file, cb) {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont acceptés.'));
    }
}

const upload = multer({
    storage: stockage,
    fileFilter: filtrePdf,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 Mo max
});

module.exports = upload;