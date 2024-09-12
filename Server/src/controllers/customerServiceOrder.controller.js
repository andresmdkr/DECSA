const { CustomerServiceOrder } = require('../db.js');
const path = require('path');

// Crear una nueva O.A.C
const createCustomerServiceOrder = async (data, files) => {
    const { sacId, status, emissionDate, resolution, resolutionDate, assignedTechnician } = data;
  
    // Manejar los archivos subidos si existen
    let filePaths = [];
    if (files && files.length > 0) {
      files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        filePaths.push(filePath);
      });
    }
 
    const newOrder = await CustomerServiceOrder.create({
      sacId, 
      status,
      emissionDate,
      resolution,
      resolutionDate,
      assignedTechnician,
      files: filePaths, 
    });
  
    return newOrder;
  };
  

const getCustomerServiceOrders = async (query) => {
    const { sacId } = query;
    let whereClause = {};
    if (sacId) {
      whereClause.sacId = sacId;
    }
  
    const orders = await CustomerServiceOrder.findAll({
      where: whereClause
    });
    
    return orders;
  };

const updateCustomerServiceOrder = async (id, data, files) => {
  const order = await CustomerServiceOrder.findByPk(id);
  if (!order) throw new Error('Order not found');

  const { status, resolution, resolutionDate, assignedTechnician } = data;

  // Manejar la actualización de archivos si se suben nuevos archivos
  let filePaths = order.files;
  if (files && files.length > 0) {
    files.forEach(file => {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      filePaths.push(filePath);
    });
  }

  // Actualizar el registro en la base de datos
  order.status = status || order.status;
  order.resolution = resolution || order.resolution;
  order.resolutionDate = resolutionDate || order.resolutionDate;
  order.assignedTechnician = assignedTechnician || order.assignedTechnician;
  order.files = filePaths;

  await order.save();

  return order;
};

module.exports = {
  createCustomerServiceOrder,
  getCustomerServiceOrders,
  updateCustomerServiceOrder
};
