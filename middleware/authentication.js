const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access Denied');

    try {
        const user = jwt.verify(token, process.env.secret);
        req.user = user;
        req.isAdmin = user.isAdmin;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
}