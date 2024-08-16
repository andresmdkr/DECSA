const { Router } = require("express");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");
const clientRouter = require("./client.routes.js");

const router = Router();

router.use("/auth", authRouter); 
router.use("/user", userRouter); 
router.use("/client", clientRouter);

module.exports = router;
