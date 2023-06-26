const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const isAdmin = jwt.verify(req.header('auth-token'), process.env.secret);
    req.isAdmin = isAdmin;
    next();
}