const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { 
  createInternalWorkOrderHandler, 
  getInternalWorkOrdersHandler, 
  updateInternalWorkOrderHandler 
} = require('../handlers/internalWorkOrder.handler.js');
const upload = require('../middleware/multerConfig.js');  

const internalWorkOrderRouter = Router();

internalWorkOrderRouter.post('/', isAuthenticated, upload.array('files'), createInternalWorkOrderHandler);

internalWorkOrderRouter.get('/', isAuthenticated, getInternalWorkOrdersHandler);

internalWorkOrderRouter.put('/:id', isAuthenticated, upload.array('files'), updateInternalWorkOrderHandler);

module.exports = internalWorkOrderRouter;
