const { InternalWorkOrder, SAC } = require('../db.js');
const path = require('path');

const fs = require('fs');

const handleInternalFileUpload = async (files, iotId) => {
  const filePaths = [];

  if (files && files.length > 0) {
    const dir = path.join(__dirname, '../../uploads/OTI', `OTI-${iotId}`);
    fs.mkdirSync(dir, { recursive: true });

    files.forEach(file => {
      const filePath = path.join(dir, file.originalname);
      fs.renameSync(file.path, filePath);
      filePaths.push(filePath);
    });
  }

  await InternalWorkOrder.update({ files: filePaths }, { where: { id: iotId } });
};

const createInternalWorkOrder = async (data) => {
  let { sacId, status, task, date, location, observations, assignedTo, completionDate, isDerived } = data;

  sacId = sacId ?? null;
  observations = observations ?? null;

  const newOrderData = {
    sacId,
    status,
    task,
    date,
    location,
    observations,
    assignedTo,
    isDerived: isDerived || false,  
  };

  if (completionDate !== null && completionDate !== undefined && completionDate !== '' && completionDate !== 'null') {
    console.log("entre")
    console.log(completionDate)
    newOrderData.completionDate = completionDate;
  }

  try {
    const newOrder = await InternalWorkOrder.create(newOrderData);
    return newOrder;
  } catch (error) {
    console.error('Error al crear la orden de trabajo interna:', error);
    throw error;
  }
};


const getInternalWorkOrders = async (query) => {
    const { sacId, otiId, page = 1, limit = 10 } = query;
    let whereClause = {};

    if (sacId) {
        whereClause.sacId = sacId;
    }
    
    if (otiId) {
        whereClause.id = otiId; 
    }

    const offset = (page - 1) * limit;

    const orders = await InternalWorkOrder.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']],
        include: [
            {
                model: SAC,
                as: 'sac',
            },
        ],
    });

    return { rows: orders.rows, total: orders.count }; 
};



  

const updateInternalWorkOrder = async (id, data, files) => {
  const order = await InternalWorkOrder.findByPk(id);
  if (!order) throw new Error('Internal Work Order not found');

  const { status, task, date, location, observations, assignedTo, completionDate } = data;

  order.status = status || order.status;
  order.task = task || order.task;
  order.date = date || order.date;
  order.location = location || order.location;
  order.observations = observations || order.observations;
  order.assignedTo = assignedTo || order.assignedTo;

  if (completionDate !== null && completionDate !== undefined && completionDate !== '' && completionDate !== 'null') {
    order.completionDate = completionDate;
  }

  if (files && files.length > 0) {
    const dir = path.join(__dirname, '../../uploads/OTI', `OTI-${id}`);
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
  handleInternalFileUpload,
  createInternalWorkOrder,
  getInternalWorkOrders,
  updateInternalWorkOrder
};
