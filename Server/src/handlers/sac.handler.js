const { createSAC, getSACs, updateSAC } = require('../controllers/sac.controller.js');

const createSACHandler = async (req, res) => {
  try {
    const sacData = req.body;
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

module.exports = {
  createSACHandler,
  getSACsHandler,
  updateSACHandler,
};
