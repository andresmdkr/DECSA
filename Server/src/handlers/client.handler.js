const {
    getAllClients,
    getClientByAccountNumber,
    createClient,
    updateClientByAccountNumber,
    deleteClientByAccountNumber,
    searchClients,
} = require('../controllers/client.controller');


const getAllClientsHandler = async (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    try {
        const clients = await getAllClients(page, limit);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
};


const getClientByAccountNumberHandler = async (req, res) => {
    const { accountNumber } = req.params;
    try {
        const client = await getClientByAccountNumber(accountNumber);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching client', error: error.message });
    }
};


const createClientHandler = async (req, res) => {
    try {
        const newClient = await createClient(req.body);
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};


const updateClientByAccountNumberHandler = async (req, res) => {
    const { accountNumber } = req.params;
    try {
        const updatedClient = await updateClientByAccountNumber(accountNumber, req.body);
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating client', error: error.message });
    }
};


const deleteClientByAccountNumberHandler = async (req, res) => {
    const { accountNumber } = req.params;
    try {
        const deletedClient = await deleteClientByAccountNumber(accountNumber);
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting client', error: error.message });
    }
};


const searchClientsHandler = async (req, res) => {
    try {
        const clients = await searchClients(req.query);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error searching clients', error: error.message });
    }
};

module.exports = {
    getAllClientsHandler,
    getClientByAccountNumberHandler,
    createClientHandler,
    updateClientByAccountNumberHandler,
    deleteClientByAccountNumberHandler,
    searchClientsHandler,
};
