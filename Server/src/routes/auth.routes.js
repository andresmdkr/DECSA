const { Router } = require("express");
const { loginHandler, signupHandler,refreshTokenHandler } = require("../handlers/auth.handler.js");
const { isAdmin, isAuthenticated } = require("../middleware/authMiddleware.js");

const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/signup",isAuthenticated, isAdmin, signupHandler);
authRouter.post("/refresh-token", refreshTokenHandler);

module.exports = authRouter;
