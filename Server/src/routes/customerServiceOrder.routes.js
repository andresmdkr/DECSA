const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createCustomerServiceOrderHandler, getCustomerServiceOrdersHandler, updateCustomerServiceOrderHandler } = require('../handlers/customerServiceOrder.handler.js');
const upload = require('../middleware/multerConfig.js');  

const customerServiceOrderRouter = Router();

// Crear una nueva O.A.C con archivos
customerServiceOrderRouter.post('/', isAuthenticated, upload.array('files'), createCustomerServiceOrderHandler);

// Obtener todas las O.A.C
customerServiceOrderRouter.get('/', isAuthenticated, getCustomerServiceOrdersHandler);

// Actualizar una O.A.C con nuevos archivos
customerServiceOrderRouter.put('/:id', isAuthenticated, upload.array('files'), updateCustomerServiceOrderHandler);

module.exports = customerServiceOrderRouter;
