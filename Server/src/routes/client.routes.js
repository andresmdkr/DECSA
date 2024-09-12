const { Router } = require("express");
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
    getAllClientsHandler,
    getClientByAccountNumberHandler,
    createClientHandler,
    updateClientByAccountNumberHandler,
    deleteClientByAccountNumberHandler,
    searchClientsHandler,
} = require('../handlers/client.handler');

const clientRouter = Router();


clientRouter.get('/', isAuthenticated, getAllClientsHandler);
clientRouter.get('/:accountNumber', isAuthenticated, getClientByAccountNumberHandler);
clientRouter.get('/search', isAuthenticated, searchClientsHandler);

clientRouter.post('/', isAuthenticated, createClientHandler);

clientRouter.put('/:accountNumber', isAuthenticated, updateClientByAccountNumberHandler);

clientRouter.delete('/:accountNumber', isAuthenticated, deleteClientByAccountNumberHandler);

module.exports = clientRouter;
