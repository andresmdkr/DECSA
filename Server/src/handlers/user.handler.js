const { getAllUsers,createUser, getUserById, getUserByName, updateUser, deleteUser } = require("../controllers/user.controller.js");


const handleError = (res, error, message = "Error interno del servidor") => {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message });
};


const allUsersHandler = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        handleError(res, error);
    }
};


const createUserHandler = async (req, res) => {
    const userData = req.body;

    try {
        const newUser = await createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const byIdHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        handleError(res, error);
    }
};

const byNameHandler = async (req, res) => {
    const { name } = req.params;
    try {
        const users = await getUserByName(name);
        if (users.length === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios" });
        }
        res.json(users);
    } catch (error) {
        handleError(res, error);
    }
};

const updateUserHandler = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
  
    try {
  
      const updatedUser = await updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      handleError(res, error);
    }
  };

const deleteHandler = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = { allUsersHandler,createUserHandler, byIdHandler, byNameHandler, updateUserHandler, deleteHandler };
