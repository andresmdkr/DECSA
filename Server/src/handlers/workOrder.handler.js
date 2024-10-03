const { handleFileUpload, createWorkOrder, getWorkOrders, updateWorkOrder } = require('../controllers/workOrder.controller.js');

const createWorkOrderHandler = async (req, res) => {
  try {

    const workOrder = await createWorkOrder(req.body);


    await handleFileUpload(req.files, workOrder.id);

    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkOrdersHandler = async (req, res) => {
  try {
    const workOrders = await getWorkOrders(req.query);  
    res.status(200).json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkOrderHandler = async (req, res) => {
  try {
    const updatedWorkOrder = await updateWorkOrder(req.params.id, req.body, req.files); 
    res.status(200).json(updatedWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkOrderHandler,
  getWorkOrdersHandler,
  updateWorkOrderHandler
};
