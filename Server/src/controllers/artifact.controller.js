const { BurnedArtifact,SAC,Client,RepairOrder,WorkOrder } = require('../db');
const { Op } = require('sequelize');

const getArtifacts = async (filters) => {
  const { sacId, clientId, status, page = 1, limit = 10, order = 'DESC' } = filters;

  const whereClause = {};

  // Agregar filtros condicionalmente
  if (sacId) whereClause.sacId = { [Op.eq]: sacId };
  if (clientId) whereClause.clientId = clientId; // Filtro por clientId
  if (status) whereClause.status = status;

  const offset = (page - 1) * limit;

  const artifacts = await BurnedArtifact.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: SAC, 
      },
      {
        model: Client, 
        attributes: ['accountNumber'], 
      },
      {
        model: RepairOrder, 
        as: 'repairOrder', 
      },
      {
        model: WorkOrder,
        as: 'workOrder'
      },
    ],
    distinct: true, 
    limit: parseInt(limit),
    offset: offset,
    order: [['id', order]],
  });

  return artifacts;
};


const getArtifact = async (id) => {
  const artifact = await BurnedArtifact.findByPk(id, {
    include: [
      {
        model: SAC, 
      },
      {
        model: RepairOrder,
        as: 'repairOrder',
      },
      {
        model: WorkOrder,
        as: 'workOrder'
      },
    ],
  });
  
  return artifact;
};


const updateArtifact = async (id, updatedData) => {
    const artifact = await BurnedArtifact.findByPk(id);
    console.log(updatedData)
  
    if (!artifact) {
      throw new Error('Artifact not found');
    }
  
    const updatedArtifact = await artifact.update({
      status: updatedData.status,
    });
  
    return updatedArtifact;
  };
  

module.exports = {
  getArtifacts,
  getArtifact,
  updateArtifact,
};
