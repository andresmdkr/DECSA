const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
    getAllClientsHandler,
    getClientByAccountNumberHandler,
    createClientHandler,
    updateClientByAccountNumberHandler,
    deleteClientByAccountNumberHandler,
    searchClientsHandler,
} = require('../handlers/client.handler');

const router = express.Router();


router.get('/', isAuthenticated, getAllClientsHandler);
router.get('/:accountNumber', isAuthenticated, getClientByAccountNumberHandler);
router.get('/search', isAuthenticated, searchClientsHandler);

router.post('/', isAuthenticated, createClientHandler);

router.put('/:accountNumber', isAuthenticated, updateClientByAccountNumberHandler);

router.delete('/:accountNumber', isAuthenticated, deleteClientByAccountNumberHandler);

module.exports = router;
