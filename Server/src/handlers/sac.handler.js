const { createSAC, getSACs, updateSAC,getResolution, createResolution,updateResolution } = require('../controllers/sac.controller.js');

const createSACHandler = async (req, res) => {
  try {
    const sacData = req.body;
    
    if (!sacData.clientId) {
      sacData.clientId = null;
    }

    const newSAC = await createSAC(sacData);
    res.status(201).json(newSAC);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getSACsHandler = async (req, res) => {
  try {
    const filters = req.query; 
    const sacs = await getSACs(filters);
    
    res.status(200).json({
      sacs: sacs.rows, 
      total: sacs.count, 
      totalPages: Math.ceil(sacs.count / (parseInt(filters.limit) || 10)),
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 10,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSACHandler = async (req, res) => {
  try {
    const sacId = req.params.id;
    const updatedData = req.body; 

    const updatedSAC = await updateSAC(sacId, updatedData); 

    res.status(200).json(updatedSAC); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResolutionHandler = async (req, res) => {
  const { sacId } = req.params;

  try {
    const resolution = await getResolution(sacId);
    return res.status(200).json(resolution);
  } catch (error) {
    if (error.message.includes('No se encontró')) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const createResolutionHandler = async (req, res) => {
  const { sacId } = req.params; 
  const { type, description, clientNotified } = req.body;

  try {
    const newResolution = await createResolution(sacId, {
      type,
      description,
      clientNotified,
    });

    res.status(201).json(newResolution);
  } catch (error) {
    console.error('Error al crear la resolución:', error);
    res.status(500).json({ error: 'Error al crear la resolución' });
  }
};

const updateResolutionHandler = async (req, res) => {
  try {
    const { sacId, resolutionId } = req.params; 
    const updatedData = req.body; 

    const updatedResolution = await updateResolution(sacId, resolutionId, updatedData); 

    res.status(200).json(updatedResolution); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSACHandler,
  getSACsHandler,
  updateSACHandler,
  getResolutionHandler,
  createResolutionHandler,
  updateResolutionHandler
};
