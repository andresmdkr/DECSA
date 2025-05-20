const { Router } = require("express");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");
const clientRouter = require("./client.routes.js");
const sacRouter = require("./sac.routes.js");
const customerServiceOrderRouter = require("./customerServiceOrder.routes.js");
const artifactRouter = require("./artifact.routes.js");
const workOrderRouter = require("./workOrder.routes.js");
const resolutionRouter = require("./resolution.routes.js");
const technicalServiceRouter = require("./technicalService.routes.js");
const repairOrderRouter = require("./repairOrder.routes.js");
const internalWorkOrderRouter = require("./internalWorkOrder.routes.js");

const router = Router();

router.use("/auth", authRouter); 
router.use("/user", userRouter); 
router.use("/client", clientRouter);
router.use("/sacs", sacRouter);
router.use("/oac", customerServiceOrderRouter);
router.use("/artifact", artifactRouter);
router.use("/ot", workOrderRouter);
router.use("/repair-order", repairOrderRouter);
router.use("/resolution", resolutionRouter);
router.use("/technical-service", technicalServiceRouter);
router.use("/oti", internalWorkOrderRouter);

module.exports = router;
