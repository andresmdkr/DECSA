const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createCustomerServiceOrderHandler, getCustomerServiceOrdersHandler, updateCustomerServiceOrderHandler } = require('../handlers/customerServiceOrder.handler.js');
const upload = require('../middleware/multerConfig.js');  

const customerServiceOrderRouter = Router();

customerServiceOrderRouter.post('/', isAuthenticated, upload.fields([{ name: 'mainFile', maxCount: 1 }, { name: 'files' }]), createCustomerServiceOrderHandler);

customerServiceOrderRouter.get('/', isAuthenticated, getCustomerServiceOrdersHandler);

customerServiceOrderRouter.put('/:id', isAuthenticated, upload.fields([{ name: 'mainFile', maxCount: 1 }, { name: 'files' }]), updateCustomerServiceOrderHandler);

module.exports = customerServiceOrderRouter;



/* const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createCustomerServiceOrderHandler, getCustomerServiceOrdersHandler, updateCustomerServiceOrderHandler } = require('../handlers/customerServiceOrder.handler.js');
const upload = require('../middleware/multerConfig.js');  

const customerServiceOrderRouter = Router();


customerServiceOrderRouter.post('/', isAuthenticated, upload.array('files'), createCustomerServiceOrderHandler);


customerServiceOrderRouter.get('/', isAuthenticated, getCustomerServiceOrdersHandler);


customerServiceOrderRouter.put('/:id', isAuthenticated, upload.array('files'), updateCustomerServiceOrderHandler);

module.exports = customerServiceOrderRouter;
 */