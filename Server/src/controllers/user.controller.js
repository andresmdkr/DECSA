const { User } = require("../db.js");
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const getAllUsers = async () => {
    return User.findAll();
};


const createUser = async (userData) => {
    const { username, name, lastName, password, role, status } = userData;
    console.log(userData)
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        throw new Error("El nombre de usuario ya está en uso");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        username,
        name,
        lastName,
        password: hashedPassword,
        role,
        status,
    });

    return newUser;
};

const getUserById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

const getUserByName = async (name) => {
    return User.findAll({ where: { name: { [Op.iLike]: `%${name}%` } } });
};


const updateUserFields = (user, userData) => {
    const fields = ['username', 'name', 'password', 'lastName', 'role', 'status'];
    fields.forEach((field) => {
      if (userData[field]) user[field] = userData[field];
    });
  };
  

const updateUser = async (id, userData) => {
    const user = await getUserById(id);
    console.log(userData)

    if (userData.password) {
        console.log(userData.password);
        userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    updateUserFields(user, userData);
    await user.save();
    return user;
};


const deleteUser = async (id) => {
    const user = await getUserById(id);
    await User.destroy({ where: { id } });
    return { message: "Usuario eliminado" };
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    getUserByName,
    updateUser,
    deleteUser
};
