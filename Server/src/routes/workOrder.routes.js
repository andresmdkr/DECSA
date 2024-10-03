const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createWorkOrderHandler, getWorkOrdersHandler, updateWorkOrderHandler } = require('../handlers/workOrder.handler.js');
const upload = require('../middleware/multerConfig.js');  

const workOrderRouter = Router();


workOrderRouter.post('/', isAuthenticated, upload.array('files'), createWorkOrderHandler);


workOrderRouter.get('/', isAuthenticated, getWorkOrdersHandler);


workOrderRouter.put('/:id', isAuthenticated, upload.array('files'), updateWorkOrderHandler);

module.exports = workOrderRouter;
