const { CustomerServiceOrder } = require('../db.js');
const path = require('path');
const fs = require('fs');

const handleFileUpload = async (files, oacId) => {
    const filePaths = [];
    
    if (files && files.length > 0) {
        const dir = path.join(__dirname, '../../uploads/oac', `OAC-${oacId}` );
        
        fs.mkdirSync(dir, { recursive: true });

        files.forEach(file => {
            const filePath = path.join(dir, file.originalname);
            fs.renameSync(file.path, filePath); 
            filePaths.push(filePath); 
        });
    }


    await CustomerServiceOrder.update({ files: filePaths }, { where: { id: oacId } });
};

/* const handleFileUpload = async (files, oacId) => {
    const filePaths = []; // Aquí almacenamos las rutas públicas

    if (files && files.length > 0) {
        // Define el directorio de destino para los archivos
        const dir = path.join(__dirname, '../../uploads/oac', `OAC-${oacId}`);

        // Crea el directorio si no existe
        fs.mkdirSync(dir, { recursive: true });

        // Mueve los archivos y guarda solo la ruta relativa pública
        files.forEach(file => {
            const filePath = path.join(dir, file.originalname); // Ruta completa en el sistema de archivos
            fs.renameSync(file.path, filePath); 

            // Aquí guardamos solo la ruta pública para la base de datos
            const publicPath = `/uploads/oac/OAC-${oacId}/${file.originalname}`;
            filePaths.push(publicPath); // Guardamos la ruta pública, no la del sistema
        });
    }

    // Actualiza los archivos en la base de datos usando solo rutas públicas
    await CustomerServiceOrder.update({ files: filePaths }, { where: { id: oacId } });
}; */



const createCustomerServiceOrder = async (data) => {
    const { sacId, status, issueDate, issueTime, assignedPerson, assignedBy, assignmentTime,oacReason, tension, pendingTasks,failureReason,performedWork } = data;

    const newOrder = await CustomerServiceOrder.create({
        sacId,
        status,
        issueDate,
        issueTime,
        assignedPerson,
        assignedBy,
        assignmentTime,
        oacReason,
        tension,
        pendingTasks,
        failureReason,
        performedWork,
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

    const { status, tension, pendingTasks, assignedPerson, assignedBy, assignmentTime,oacReason,failureReason,performedWork } = data;


    order.status = status || order.status;
    order.tension = tension || order.tension;
    order.pendingTasks = pendingTasks || order.pendingTasks;
    order.assignedPerson = assignedPerson || order.assignedPerson;
    order.assignedBy = assignedBy || order.assignedBy;
    order.assignmentTime = assignmentTime || order.assignmentTime;
    order.oacReason = oacReason || order.oacReason;
    order.failureReason = failureReason || order.failureReason;
    order.performedWork = performedWork || order.performedWork;

   
    if (files && files.length > 0) {
        const dir = path.join(__dirname, '../../uploads/oac', `OAC-${id}` );
        
      
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
    createCustomerServiceOrder,
    getCustomerServiceOrders,
    updateCustomerServiceOrder
};
