const jwt = require("jsonwebtoken");
const { User } = require("../db.js");
const { JWT_SECRET } = process.env;

async function isAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado" });
        }
        res.status(401).json({ message: "Token inválido" });
    }
}


function isAdmin(req, res, next) {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
}

module.exports = { isAuthenticated, isAdmin };

