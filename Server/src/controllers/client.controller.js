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
    const { device, ...restQuery } = query;

    // Manejar los filtros normales como holderName, substation, etc.
    Object.keys(restQuery).forEach((key) => {
        if (restQuery[key]) {
            if (key === 'holderName') {
                const nameParts = restQuery[key].split(' ')
                    .map(part => part.trim())
                    .filter(part => part.length > 0);

                whereClause[Op.and] = nameParts.map(part => ({
                    holderName: { [Op.iLike]: `%${part}%` }
                }));
            } else {
                whereClause[key] = { [Op.iLike]: `%${restQuery[key]}%` };
            }
        }
    });

    // Si se está buscando por número de medidor
    if (device) {
        // Limpiar ceros y espacios del dispositivo
        const trimmedDevice = device.trim();
        const normalizedDevice = trimmedDevice.replace(/^0+|0+$/g, '');

        return await Client.findAll({
            where: {
                ...whereClause,
                [Op.or]: [
                    { device: { [Op.iLike]: `%${trimmedDevice}%` } },
                    { device: { [Op.iLike]: `%${normalizedDevice}%` } }
                ]
            },
            limit: 5
        });
    }

    // Si no hay device, búsqueda normal
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
