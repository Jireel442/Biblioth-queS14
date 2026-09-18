function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).json({
        erreur: err.message || 'Une erreur interne est survenue.'
    });
}

module.exports = errorHandler;