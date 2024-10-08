const { Client } = require("../db.js");
const { Op } = require('sequelize');


const getAllClients = async (page, limit) => {
    const offset = (page - 1) * limit;
    return await Client.findAll({
        limit,
        offset
    });
};


const getClientByAccountNumber = async (accountNumber) => {
    return await Client.findOne({ where: { accountNumber } });
};


const createClient = async (clientData) => {
    return await Client.create(clientData);
};


const updateClientByAccountNumber = async (accountNumber, clientData) => {
    console.log(accountNumber, clientData);
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
            if (key === 'holderName') {
                const nameParts = query[key].split(' ').map(part => part.trim()).filter(part => part.length > 0);
                
                whereClause[Op.and] = nameParts.map(part => ({
                    holderName: { [Op.iLike]: `%${part}%` }
                }));
            } else {
                whereClause[key] = { [Op.iLike]: `%${query[key]}%` };
            }
        }
    });

    return await Client.findAll({ 
        where: whereClause,
        limit: 5  
    });
};



module.exports = {
    getAllClients,
    getClientByAccountNumber,
    createClient,
    updateClientByAccountNumber,
    deleteClientByAccountNumber,
    searchClients,
};
