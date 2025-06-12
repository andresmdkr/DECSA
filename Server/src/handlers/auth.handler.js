const { User } = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

async function loginHandler(req, res) {
    const { username, password } = req.body;

     const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token, role: user.role, username: user.username, name: user.name, lastName: user.lastName });
}

async function signupHandler(req, res) {
    const { username, password, role, name, lastName } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashPassword, role, name, lastName });

    res.status(201).json(newUser);
}

function refreshTokenHandler(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }); 
        const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
}


module.exports = { loginHandler, signupHandler, refreshTokenHandler };
