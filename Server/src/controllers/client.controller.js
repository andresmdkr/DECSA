const { Client } = require("../db.js");
const { Op } = require('sequelize');


const getAllClients = async () => {
    return await Client.findAll();
};


const getClientByAccountNumber = async (accountNumber) => {
    return await Client.findOne({ where: { accountNumber } });
};


const createClient = async (clientData) => {
    return await Client.create(clientData);
};


const updateClientByAccountNumber = async (accountNumber, clientData) => {
    const client = await Client.findOne({ where: { accountNumber } });
    if (!client) return null;
    return await client.update(clientData);
};


const deleteClientByAccountNumber = async (accountNumber) => {
    const client = await Client.findOne({ where: { accountNumber } });
    if (!client) return null;
    await client.destroy();
    return client;
};


const searchClients = async (query) => {
    const whereClause = {};
    Object.keys(query).forEach((key) => {
        if (query[key]) {
            whereClause[key] = { [Op.iLike]: `%${query[key]}%` };
        }
    });
    return await Client.findAll({ where: whereClause });
};

module.exports = {
    getAllClients,
    getClientByAccountNumber,
    createClient,
    updateClientByAccountNumber,
    deleteClientByAccountNumber,
    searchClients,
};
