const { User } = require("../db.js");
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const getAllUsers = async () => {
    return User.findAll();
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
    const fields = ['username', 'name','password', 'lastName', 'role', 'status'];
    fields.forEach(field => {
        if (userData[field]) user[field] = userData[field];
    });
};

const updateUser = async (id, userData) => {
    const user = await getUserById(id);

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
    getUserById,
    getUserByName,
    updateUser,
    deleteUser
};
