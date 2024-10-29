const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createRepairOrderHandler, getRepairOrderHandler, updateRepairOrderHandler } = require('../handlers/repairOrder.handler.js');

const repairOrderRouter = Router();

repairOrderRouter.post('/', isAuthenticated, createRepairOrderHandler);
repairOrderRouter.get('/:burnedArtifactId', isAuthenticated, getRepairOrderHandler);
repairOrderRouter.put('/:id', isAuthenticated, updateRepairOrderHandler);

module.exports = repairOrderRouter;
