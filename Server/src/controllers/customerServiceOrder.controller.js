const { CustomerServiceOrder } = require('../db.js');
const path = require('path');
const fs = require('fs');

const handleFileUpload = async (files, dir) => {
    const filePaths = [];
  
    // Asegurarse de que el directorio existe
    fs.mkdirSync(dir, { recursive: true });
  
    files.forEach(file => {
      // Nombre final basado en `originalname`
      const finalFileName = file.originalname;
      const filePath = path.join(dir, finalFileName);
  
      // Mover el archivo desde la ubicación temporal
      fs.renameSync(file.path, filePath);
  
      // Agregar la ruta final al array de resultados
      filePaths.push(filePath);
    });
  
    return filePaths;
  };
  

    const createCustomerServiceOrder = async (data, mainFile) => {
      const dir = path.join(__dirname, '../../uploads/OAC', `OAC-${data.id}`);
      console.log(data);
    
      const mainFilePath = (await handleFileUpload([mainFile], dir))[0];
    
      const newOrder = await CustomerServiceOrder.create({
        sacId: data.sacId,
        id: data.id,
        assignedPerson: data.assignedPerson|| 'No asignado',
        assignedBy: data.assignedBy|| 'No asignado',
        mainFile: mainFilePath,
        status: 'Open',
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

const updateCustomerServiceOrder = async (id, data, mainFile, otherFiles) => {
    try {
      const order = await CustomerServiceOrder.findByPk(id);
      if (!order) throw new Error('Order not found');
  
      const dir = path.join(__dirname, '../../uploads/OAC', `OAC-${id}`);
      console.log(mainFile);
  
      if (mainFile) {

        if (order.mainFile && fs.existsSync(path.join(dir, path.basename(order.mainFile)))) {
          fs.unlinkSync(path.join(dir, path.basename(order.mainFile)));
        }
        const mainFilePath = (await handleFileUpload([mainFile], dir))[0];
        console.log(mainFilePath);
        order.mainFile = mainFilePath;
      }

      if (otherFiles.length > 0) {
        const otherFilePaths = await handleFileUpload(otherFiles, dir);
        order.files = [...(order.files || []), ...otherFilePaths];
      }
      console.log(order);
      if (data.assignedPerson) order.assignedPerson = data.assignedPerson;
      if (data.assignedBy) order.assignedBy = data.assignedBy;
      if (data.status) order.status = data.status;
      await order.save();
      return order;
    } catch (error) {
      console.error('Error en updateCustomerServiceOrder:', error);
      throw error;
    }
  };

module.exports = {
    handleFileUpload,
    createCustomerServiceOrder,
    getCustomerServiceOrders,
    updateCustomerServiceOrder,
};


/* const { CustomerServiceOrder } = require('../db.js');
const path = require('path');
const fs = require('fs');

const handleFileUpload = async (files, oacId) => {
    const filePaths = [];
    
    if (files && files.length > 0) {
        const dir = path.join(__dirname, '../../uploads/OAC', `OAC-${oacId}` );
        
        fs.mkdirSync(dir, { recursive: true });

        files.forEach(file => {
            const filePath = path.join(dir, file.originalname);
            fs.renameSync(file.path, filePath); 
            filePaths.push(filePath); 
        });
    }


    await CustomerServiceOrder.update({ files: filePaths }, { where: { id: oacId } });
};



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
        const dir = path.join(__dirname, '../../uploads/OAC', `OAC-${id}` );
        
      
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
 */