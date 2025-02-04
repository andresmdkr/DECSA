const { handleFileUpload, createCustomerServiceOrder, getCustomerServiceOrders, updateCustomerServiceOrder } = require('../controllers/customerServiceOrder.controller.js');
const { CustomerServiceOrder } = require('../db.js');

const createCustomerServiceOrderHandler = async (req, res) => {
  try {
    const { body, files } = req;

    const mainFile = files?.mainFile?.[0];

    if (!mainFile) {
      return res.status(400).json({ message: 'mainFile is required' });
    }

    // Verifica si ya existe una OAC con el mismo ID
    const existingOrder = await CustomerServiceOrder.findOne({ where: { id: body.id } });
    if (existingOrder) {
      return res.status(409).json({ message: `Ya existe una OAC con el ID ${body.id}` });
    }

    // Lógica para crear la OAC
    const customerServiceOrder = await createCustomerServiceOrder(body, mainFile);
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
    const { params, body, files } = req;
    const mainFile = files?.mainFile?.[0];
    const otherFiles = files?.files || [];

    console.log(params.id)

    // Llamar al controlador con los datos procesados
    const updatedOrder = await updateCustomerServiceOrder(
      params.id, 
      body, 
      mainFile, 
      otherFiles
    );

    // Enviar la respuesta
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error('Error al actualizar la OAC:', error);
  }
};



module.exports = {
  createCustomerServiceOrderHandler,
  getCustomerServiceOrdersHandler,
  updateCustomerServiceOrderHandler,
};




/* const { handleFileUpload, createCustomerServiceOrder, getCustomerServiceOrders, updateCustomerServiceOrder } = require('../controllers/customerServiceOrder.controller.js');

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
 */