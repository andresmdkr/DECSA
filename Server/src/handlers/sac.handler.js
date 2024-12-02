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


    const limit = filters.limit !== '-1' ? filters.limit : -1;
    const page = limit === -1 ? 1 : (parseInt(filters.page) || 1); 

    const sacs = await getSACs({ ...filters, limit, page });

    res.status(200).json({
      sacs: sacs.rows,
      total: sacs.count,
      totalPages: limit === -1 ? 1 : Math.ceil(sacs.count / (parseInt(limit)||10)),
      page,
      limit: limit === -1 ? sacs.count : limit, 
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
