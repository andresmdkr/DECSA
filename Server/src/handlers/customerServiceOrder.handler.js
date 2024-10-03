const { handleFileUpload, createCustomerServiceOrder, getCustomerServiceOrders, updateCustomerServiceOrder } = require('../controllers/customerServiceOrder.controller.js');

const createCustomerServiceOrderHandler = async (req, res) => {
  try {
      // Crea la nueva OAC
      const customerServiceOrder = await createCustomerServiceOrder(req.body);

      // Después de crear la OAC, maneja la subida de archivos
      await handleFileUpload(req.files, customerServiceOrder.id); 

      res.status(201).json(customerServiceOrder);
  } catch (error) {
      res.status(500).json({ message: error.message });
      console.error('Error al crear la OAC:', error);
  }
};

const getCustomerServiceOrdersHandler = async (req, res) => {
    try {
      const customerServiceOrders = await getCustomerServiceOrders(req.query);  
      res.status(200).json(customerServiceOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const updateCustomerServiceOrderHandler = async (req, res) => {
  try {
    const updatedCustomerServiceOrder = await updateCustomerServiceOrder(req.params.id, req.body, req.files); 
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
