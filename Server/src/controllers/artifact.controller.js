const { BurnedArtifact,SAC,Client } = require('../db');
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
    ],
    distinct: true, 
    limit: parseInt(limit),
    offset: offset,
    order: [['id', order]],
  });

  return artifacts;
};




const getArtifact = async (id) => {
  const artifact = await BurnedArtifact.findByPk(id);
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
      technicalService: updatedData.technicalService,
      technicalReport: updatedData.technicalReport,
      conclusion: updatedData.conclusion,
      budget: updatedData.budget || null 
    });
  
    return updatedArtifact;
  };
  

module.exports = {
  getArtifacts,
  getArtifact,
  updateArtifact,
};
