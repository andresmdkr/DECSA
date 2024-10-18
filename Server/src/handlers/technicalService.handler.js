const { getAllTechnicalServices, getTechnicalServiceById, createTechnicalService, updateTechnicalService, deleteTechnicalService } = require("../controllers/technicalService.controller.js");

const handleError = (res, error, message = "Error interno del servidor") => {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message });
};

const allTechnicalServicesHandler = async (req, res) => {
    try {
        const services = await getAllTechnicalServices();
        res.json(services);
    } catch (error) {
        handleError(res, error);
    }
};

const byIdTechnicalServiceHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await getTechnicalServiceById(id);
        res.json(service);
    } catch (error) {
        handleError(res, error);
    }
};

const createTechnicalServiceHandler = async (req, res) => {
    const serviceData = req.body;
    try {
        const newService = await createTechnicalService(serviceData);
        res.status(201).json(newService);
    } catch (error) {
        handleError(res, error);
    }
};

const updateTechnicalServiceHandler = async (req, res) => {
    const { id } = req.params;
    const serviceData = req.body;
    try {
        const updatedService = await updateTechnicalService(id, serviceData);
        res.json(updatedService);
    } catch (error) {
        handleError(res, error);
    }
};

const deleteTechnicalServiceHandler = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteTechnicalService(id);
        res.json({ message: "Servicio técnico eliminado" });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    allTechnicalServicesHandler,
    byIdTechnicalServiceHandler,
    createTechnicalServiceHandler,
    updateTechnicalServiceHandler,
    deleteTechnicalServiceHandler,
};
