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

/* const handleFileUpload = async (files, otId) => {
  const filePaths = []; // Aquí almacenamos las rutas públicas

  if (files && files.length > 0) {
    // Define el directorio de destino para los archivos
    const dir = path.join(__dirname, '../../uploads/OT', `OT-${otId}`);

    // Crea el directorio si no existe
    fs.mkdirSync(dir, { recursive: true });

    // Mueve los archivos y guarda solo la ruta relativa pública
    files.forEach(file => {
      const filePath = path.join(dir, file.originalname); // Ruta completa en el sistema de archivos
      fs.renameSync(file.path, filePath); 

      // Aquí guardamos solo la ruta pública para la base de datos
      const publicPath = `/uploads/OT/OT-${otId}/${file.originalname}`;
      filePaths.push(publicPath); // Guardamos la ruta pública, no la del sistema
    });
  }

  // Actualiza los archivos en la base de datos usando solo rutas públicas
  await WorkOrder.update({ files: filePaths }, { where: { id: otId } });
}; */



const createWorkOrder = async (data) => {
  let { sacId, burnedArtifactId, status, reason, description,technicalService } = data;

  if (!sacId) {
    sacId = null;
  }

  if (!burnedArtifactId) {
    burnedArtifactId = null;
  }

  console.log({ sacId, burnedArtifactId, status, reason, description,technicalService });

  try {
    const newOrder = await WorkOrder.create({
      sacId,
      burnedArtifactId,
      status,
      reason,
      description,
      technicalService,

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

  const { status, description, reason, technicalService } = data;

  console.log( technicalService)

  order.status = status || order.status;
  order.description = description || order.description;
  order.reason = reason || order.reason;
  order.technicalService = technicalService || order.technicalService;

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
