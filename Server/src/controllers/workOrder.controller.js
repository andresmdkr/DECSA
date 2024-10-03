const { WorkOrder } = require('../db.js');
const path = require('path');
const fs = require('fs');

const handleFileUpload = async (files, otId) => {
  const filePaths = [];

  if (files && files.length > 0) {
    const dir = path.join(__dirname, '../../uploads/OT', `OT-${otId}`);


    fs.mkdirSync(dir, { recursive: true });

   
    files.forEach(file => {
      const filePath = path.join(dir, file.originalname);
      fs.renameSync(file.path, filePath); 
      filePaths.push(filePath);
    });
  }

  
  await WorkOrder.update({ files: filePaths }, { where: { id: otId } });
};

const createWorkOrder = async (data) => {
  let { sacId, burnedArtifactId, status, reason, description } = data;

  if (!sacId) {
    sacId = null;
  }

  if (!burnedArtifactId) {
    burnedArtifactId = null;
  }

  console.log({ sacId, burnedArtifactId, status, reason, description });

  try {
    const newOrder = await WorkOrder.create({
      sacId,
      burnedArtifactId,
      status,
      reason,
      description,
    });
    return newOrder;
  } catch (error) {
    console.error('Error al crear la orden de trabajo:', error);
    throw error; 
  }
};


const getWorkOrders = async (query) => {
  const { sacId, burnedArtifactId } = query;
  let whereClause = {};

  if (sacId) {
    whereClause.sacId = sacId;
  }

  if (burnedArtifactId) {
    whereClause.burnedArtifactId = burnedArtifactId;
  }

  const orders = await WorkOrder.findAll({
    where: whereClause,
  });

  return orders;
};

const updateWorkOrder = async (id, data, files) => {
  const order = await WorkOrder.findByPk(id);
  if (!order) throw new Error('Order not found');

  const { status, description, reason } = data;

  order.status = status || order.status;
  order.description = description || order.description;
  order.reason = reason || order.reason;

  if (files && files.length > 0) {
    const dir = path.join(__dirname, '../../uploads/OT', `OT-${id}`);
    fs.mkdirSync(dir, { recursive: true });

    const filePaths = [];
    files.forEach(file => {
      const filePath = path.join(dir, file.originalname);
      fs.renameSync(file.path, filePath); 
      filePaths.push(filePath);
    });

    order.files = [...(order.files || []), ...filePaths]; 
  }

  await order.save();
  return order;
};

module.exports = {
  handleFileUpload,
  createWorkOrder,
  getWorkOrders,
  updateWorkOrder
};
