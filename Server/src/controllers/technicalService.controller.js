const { TechnicalService } = require("../db.js");

const getAllTechnicalServices = async () => {
    return TechnicalService.findAll();
};

const getTechnicalServiceById = async (id) => {
    const service = await TechnicalService.findByPk(id);
    if (!service) throw new Error('Servicio técnico no encontrado');
    return service;
};

const createTechnicalService = async (serviceData) => {
    return TechnicalService.create(serviceData);
};

const updateTechnicalService = async (id, serviceData) => {
    const service = await getTechnicalServiceById(id);
    Object.assign(service, serviceData); 
    await service.save();
    return service;
};

const deleteTechnicalService = async (id) => {
    const service = await getTechnicalServiceById(id);
    await service.destroy();
    return { message: "Servicio técnico eliminado" };
};

module.exports = {
    getAllTechnicalServices,
    getTechnicalServiceById,
    createTechnicalService,
    updateTechnicalService,
    deleteTechnicalService,
};
