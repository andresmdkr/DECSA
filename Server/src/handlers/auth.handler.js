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

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role, username: user.username, name: user.name, lastName: user.lastName });
}

async function signupHandler(req, res) {
    const { username, password, role, name, lastName } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashPassword, role, name, lastName });

    res.status(201).json(newUser);
}

module.exports = { loginHandler, signupHandler };
