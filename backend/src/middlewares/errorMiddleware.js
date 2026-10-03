const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Đã xảy ra lỗi trên máy chủ.', details: err.message });
};

module.exports = errorHandler;
