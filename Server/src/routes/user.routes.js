const { Router } = require("express");
const {
  allUsersHandler,
  byIdHandler,
  byNameHandler,
  updateUserHandler,
  deleteHandler,
} = require("../handlers/user.handler.js");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware.js");

const userRouter = Router();

userRouter.get("/",isAuthenticated, isAdmin, allUsersHandler);
userRouter.get("/find/:name",isAuthenticated, isAdmin, byNameHandler);
userRouter.get("/:id", isAuthenticated, byIdHandler);

userRouter.put("/:id",isAuthenticated, isAdmin, updateUserHandler);
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteHandler);

module.exports = userRouter;
