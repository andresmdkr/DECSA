const { createRepairOrder, getRepairOrder, updateRepairOrder } = require('../controllers/repairOrder.controller.js');

const createRepairOrderHandler = async (req, res) => {
  try {
    const repairOrder = await createRepairOrder(req.body);
    res.status(201).json(repairOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRepairOrderHandler = async (req, res) => {
  try {
    const repairOrder = await getRepairOrder(req.params.burnedArtifactId);
    if (!repairOrder) return res.status(404).json({ message: 'Repair order not found' });
    res.status(200).json(repairOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRepairOrderHandler = async (req, res) => {
  try {
    const updatedRepairOrder = await updateRepairOrder(req.params.id, req.body);
    res.status(200).json(updatedRepairOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRepairOrderHandler,
  getRepairOrderHandler,
  updateRepairOrderHandler,
};
