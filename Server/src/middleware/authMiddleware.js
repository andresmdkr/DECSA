const jwt = require("jsonwebtoken");
const { User } = require("../db.js");
const { JWT_SECRET } = process.env;

async function isAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Acceso no autorizado" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
}

function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
}

module.exports = { isAuthenticated, isAdmin };

