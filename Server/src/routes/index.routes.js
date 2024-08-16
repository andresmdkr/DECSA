const { Router } = require("express");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");

const router = Router();

router.use("/auth", authRouter); 
router.use("/user", userRouter); 

module.exports = router;
