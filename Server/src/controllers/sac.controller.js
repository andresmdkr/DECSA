const { SAC, BurnedArtifact,Resolution,CustomerServiceOrder,InternalWorkOrder } = require('../db');
const {motivoCategorias, submotivosPrincipales} = require('../utils/motivos');
const { Op,Sequelize } = require('sequelize');
const { Client } = require('../db');

const createSAC = async (sacData) => {
  const {
    clientId,
    claimReason,
    description,
    eventDate,
    startTime,
    endTime,
    priority,
    area,
    status,
    claimantName,
    claimantRelationship,
    claimantPhone,
    closeDate,
    closeTime,
    closedBy,
    assignedTo,
    artifacts,
  } = sacData;

console.log(clientId)

  const newSAC = await SAC.create({
    clientId: clientId || null,
    claimReason,
    description,
    eventDate,
    startTime,
    endTime,
    priority, 
    area,
    status,
    claimantName,      
    claimantRelationship,   
    claimantPhone,  
    closeDate,
    closeTime,
    closedBy,
    assignedTo,     
  });
  if (artifacts && artifacts.length > 0) {
    for (let artifact of artifacts) {
      await BurnedArtifact.create({
        sacId: newSAC.id,
        clientId:newSAC.clientId,
        name: artifact.name,
        brand: artifact.brand,
        model: artifact.model,
        serialNumber: artifact.serialNumber,
        documentation: artifact.documentation,
      });
    }
  }

  return newSAC;
};

const getSACs = async (filters) => { 
  const { sacId, clientId, claimReason, status, priority, area, page = 1, limit = 10, order = 'DESC', startDate, endDate,sort } = filters;
  console.log(filters)
  const whereClause = {};
  if (sacId) whereClause.id = { [Op.eq]: sacId };  
  if (clientId) whereClause.clientId = clientId;
  if (status) {
    if (Array.isArray(status)) {
      whereClause.status = { [Op.in]: status };
    } else {
      whereClause.status = status;
    }
  }
  if (priority) whereClause.priority = priority;
  if (area) whereClause.area = area;
  if (claimReason) {
    if (claimReason === 'Otros') {
      whereClause.claimReason = { [Op.notIn]: submotivosPrincipales };
    } else {
      const submotivos = motivoCategorias[claimReason] || [claimReason];
      whereClause.claimReason = { [Op.in]: submotivos };
    }
  }

  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  } else if (startDate) {
    whereClause.createdAt = {
      [Op.gte]: new Date(startDate),
    };
  } else if (endDate) {
    whereClause.createdAt = {
      [Op.lte]: new Date(endDate),
    };
  }

  const queryOptions = {
    where: whereClause,
    include: [
      { model: BurnedArtifact, as: 'artifacts' },
      { model: Resolution, as: 'resolutions' },
      { model: CustomerServiceOrder, as: 'customerServiceOrders' },
      { model: InternalWorkOrder, as: 'internalWorkOrders' },
    ],
    distinct: true,
  };

if (sort === 'status') {
  queryOptions.order = [
    [
      Sequelize.literal(`CASE WHEN "SAC"."status" = 'Pending' THEN 1 WHEN "SAC"."status" = 'Open' THEN 2 ELSE 3 END`)
    ],
    ['id', order],
  ];
} else if (sort === 'id') {
  queryOptions.order = [['id', order]];
} else {
  queryOptions.order = [[sort || 'id', order]];
}



  if (limit !== undefined && limit !== -1) {
    queryOptions.limit = parseInt(limit);
    queryOptions.offset = (page - 1) * parseInt(limit);
  }

try {
  const sacs = await SAC.findAndCountAll(queryOptions);
  return sacs;
} catch (error) {
  console.error('Error en findAndCountAll:', error);
  throw error;
}
};




const updateSAC = async (id, updatedData) => {
  const {
    clientId,
    claimReason,
    description,
    eventDate,
    startTime,
    endTime,
    status,
    priority,
    area,
    closeDate,
    closeTime,
    closedBy,
    assignedTo,
    artifacts,
  } = updatedData;


  const sac = await SAC.findByPk(id, {
    include: [{ model: BurnedArtifact, as: 'artifacts' }]
  });

  if (!sac) {
    throw new Error('SAC not found');
  }


  await sac.update({
    clientId,
    claimReason,
    description,
    eventDate,
    startTime,
    endTime,
    status,
    priority,
    area,
    closeDate,
    closeTime,
    closedBy,
    assignedTo,
  });

  if (artifacts && artifacts.length > 0) {
    const existingArtifacts = await BurnedArtifact.findAll({ where: { sacId: sac.id } });

    const existingIds = existingArtifacts.map(a => a.id);
    const newIds = artifacts.map(a => a.id).filter(id => id); 


    const artifactsToDelete = existingArtifacts.filter(a => !newIds.includes(a.id));
    await BurnedArtifact.destroy({ where: { id: artifactsToDelete.map(a => a.id) } });

    for (let artifact of artifacts) {
      if (artifact.id && existingIds.includes(artifact.id)) {

        await BurnedArtifact.update(
          {
            name: artifact.name,
            brand: artifact.brand,
            model: artifact.model,
            serialNumber: artifact.serialNumber,
            documentation: artifact.documentation,
          },
          { where: { id: artifact.id } }
        );
      } else {

        await BurnedArtifact.create({
          sacId: sac.id,
          clientId,
          name: artifact.name,
          brand: artifact.brand,
          model: artifact.model,
          serialNumber: artifact.serialNumber,
          documentation: artifact.documentation,
        });
      }
    }
  }

  return sac;
};





module.exports = {
  createSAC,
  getSACs,
  updateSAC,

};
