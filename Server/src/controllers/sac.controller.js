const { SAC, BurnedArtifact,Resolution } = require('../db');
const { Op } = require('sequelize');

const createSAC = async (sacData) => {
  const { clientId, claimReason, description, eventDate, startTime, endTime, priority, area, claimantName, claimantRelationship,claimantPhone,artifacts } = sacData;

  const newSAC = await SAC.create({
    clientId: clientId || null,
    claimReason,
    description,
    eventDate,
    startTime,
    endTime,
    priority, 
    area,
    claimantName,      
    claimantRelationship,   
    claimantPhone,       
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
  const { sacId, clientId, status, priority, area, page = 1, limit = 10, order = 'DESC' } = filters;

  const whereClause = {};
  if (sacId) whereClause.id = { [Op.eq]: sacId };  
  if (clientId) whereClause.clientId = clientId;
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (area) whereClause.area = area;

  const offset = (page - 1) * limit;

  const sacs = await SAC.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: BurnedArtifact,
        as: 'artifacts', 
      },
      {
        model: Resolution, 
        as: 'resolutions',   
      },
    ],
    distinct: true, 
    limit: parseInt(limit),
    offset: offset,
    order: [['id', order]], 
  });

  return sacs;
};



const updateSAC = async (id, updatedData) => {
  const { clientId, claimReason, description, eventDate, startTime, endTime, status, priority, area, artifacts } = updatedData;

  const sac = await SAC.findByPk(id);
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
    area
  });


  if (artifacts && artifacts.length > 0) {
    await BurnedArtifact.destroy({ where: { sacId: sac.id } });

    for (let artifact of artifacts) {
      await BurnedArtifact.create({
        sacId: sac.id,
        clientId:clientId,
        name: artifact.name,
        brand: artifact.brand,
        model: artifact.model,
        serialNumber: artifact.serialNumber,
        documentation: artifact.documentation,
      });
    }
  }

  return sac;
};




module.exports = {
  createSAC,
  getSACs,
  updateSAC,

};
