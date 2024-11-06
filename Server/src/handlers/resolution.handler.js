const {
  getResolutions,
  getResolutionById,
  createResolution,
  updateResolution,
} = require('../controllers/resolution.controller.js');


const getResolutionsHandler = async (req, res) => {
  try {
    const resolutions = await getResolutions(req.query); 
    res.status(200).json(resolutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResolutionByIdHandler = async (req, res) => {
  try {
    const { resolutionId } = req.params;
    const resolution = await getResolutionById(resolutionId);
    if (!resolution) {
      return res.status(404).json({ message: 'Resolución no encontrada' });
    }
    res.status(200).json(resolution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createResolutionHandler = async (req, res) => {
  try {
    const sacId = req.params.sacId;
    const resolutionData = req.body;
    const newResolution = await createResolution(sacId, resolutionData);
    res.status(201).json(newResolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateResolutionHandler = async (req, res) => {
  try {
    const resolutionId = req.params.resolutionId;
    const updatedData = req.body;
    const updatedResolution = await updateResolution(resolutionId, updatedData);
    if (!updatedResolution) {
      return res.status(404).json({ message: 'Resolution not found' });
    }
    res.status(200).json(updatedResolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getResolutionsHandler,
  getResolutionByIdHandler,
  createResolutionHandler,
  updateResolutionHandler,
};
