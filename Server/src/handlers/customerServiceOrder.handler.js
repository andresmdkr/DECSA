const { createCustomerServiceOrder, getCustomerServiceOrders, updateCustomerServiceOrder } = require('../controllers/customerServiceOrder.controller.js');

// Handler para crear una nueva O.A.C
const createCustomerServiceOrderHandler = async (req, res) => {
  try {
    const customerServiceOrder = await createCustomerServiceOrder(req.body, req.files);  // Pasamos req.files
    res.status(201).json(customerServiceOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handler para obtener todas las O.A.C o una específica
const getCustomerServiceOrdersHandler = async (req, res) => {
    try {
      const customerServiceOrders = await getCustomerServiceOrders(req.query);  
      res.status(200).json(customerServiceOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Handler para actualizar una O.A.C
const updateCustomerServiceOrderHandler = async (req, res) => {
  try {
    const updatedCustomerServiceOrder = await updateCustomerServiceOrder(req.params.id, req.body, req.files);  // Pasamos req.files
    res.status(200).json(updatedCustomerServiceOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCustomerServiceOrderHandler,
  getCustomerServiceOrdersHandler,
  updateCustomerServiceOrderHandler
};
