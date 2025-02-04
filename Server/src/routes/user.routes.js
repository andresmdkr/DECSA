const { Router } = require("express");
const {
  allUsersHandler,
  createUserHandler,
  byIdHandler,
  byNameHandler,
  updateUserHandler,
  deleteHandler,
} = require("../handlers/user.handler.js");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware.js");

const userRouter = Router();

userRouter.get("/",isAuthenticated, isAdmin, allUsersHandler);
userRouter.post("/", isAuthenticated, isAdmin, createUserHandler);
userRouter.get("/find/:name",isAuthenticated, isAdmin, byNameHandler);
userRouter.get("/:id", isAuthenticated, byIdHandler);

userRouter.put("/:id",isAuthenticated, isAdmin, updateUserHandler);
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteHandler);

module.exports = userRouter;
