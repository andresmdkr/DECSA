const { Router } = require("express");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");
const clientRouter = require("./client.routes.js");
const sacRouter = require("./sac.routes.js");
const customerServiceOrderRouter = require("./customerServiceOrder.routes.js");


const router = Router();

router.use("/auth", authRouter); 
router.use("/user", userRouter); 
router.use("/client", clientRouter);
router.use("/sacs", sacRouter);
router.use("/oac", customerServiceOrderRouter);

module.exports = router;
