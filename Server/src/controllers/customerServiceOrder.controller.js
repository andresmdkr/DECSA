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

const createCustomerServiceOrder = async (data) => {
    const { sacId, status, issueDate, issueTime, assignedPerson, assignedBy, assignmentTime,oacReason, workDescription, pendingTasks } = data;

    const newOrder = await CustomerServiceOrder.create({
        sacId,
        status,
        issueDate,
        issueTime,
        assignedPerson,
        assignedBy,
        assignmentTime,
        oacReason,
        workDescription,
        pendingTasks,
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

    const { status, workDescription, pendingTasks, assignedPerson, assignedBy, assignmentTime,oacReason } = data;


    order.status = status || order.status;
    order.workDescription = workDescription || order.workDescription;
    order.pendingTasks = pendingTasks || order.pendingTasks;
    order.assignedPerson = assignedPerson || order.assignedPerson;
    order.assignedBy = assignedBy || order.assignedBy;
    order.assignmentTime = assignmentTime || order.assignmentTime;
    order.oacReason = oacReason || order.oacReason;

   
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
