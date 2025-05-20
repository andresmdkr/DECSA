const { handleInternalFileUpload, createInternalWorkOrder, getInternalWorkOrders, updateInternalWorkOrder } = require('../controllers/internalWorkOrder.controller.js');

const createInternalWorkOrderHandler = async (req, res) => {
  try {
    const internalWorkOrder = await createInternalWorkOrder(req.body);
    await handleInternalFileUpload(req.files, internalWorkOrder.id);
    res.status(201).json(internalWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInternalWorkOrdersHandler = async (req, res) => {
    try {
      const { page, limit } = req.query;
      const internalWorkOrders = await getInternalWorkOrders({ ...req.query, page, limit });
      res.status(200).json(internalWorkOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const updateInternalWorkOrderHandler = async (req, res) => {
  try {
    const updatedInternalWorkOrder = await updateInternalWorkOrder(req.params.id, req.body, req.files);
    res.status(200).json(updatedInternalWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInternalWorkOrderHandler,
  getInternalWorkOrdersHandler,
  updateInternalWorkOrderHandler
};
