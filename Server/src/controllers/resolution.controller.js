const { Resolution, BurnedArtifact } = require('../db');

const getResolutions = async (query) => {
    const { sacId, burnedArtifactId } = query;
    let whereClause = {};
  
    if (sacId) {
      whereClause.sacId = sacId;
    }
  
    if (burnedArtifactId) {
      whereClause.burnedArtifactId = burnedArtifactId;
    }
  
    const resolutions = await Resolution.findAll({
      where: whereClause,
    });
  
    return resolutions;
  };
  
  const getResolutionById = async (resolutionId) => {
    const resolution = await Resolution.findOne({
      where: { id: resolutionId },
    });
    return resolution;
  };
  


const createResolution = async (sacId, resolutionData) => {
    console.log(resolutionData);
  const newResolution = await Resolution.create({
    ...resolutionData,
    sacId,
  });
  return newResolution;
};


const updateResolution = async (resolutionId, updatedData) => {
  const resolution = await Resolution.findByPk(resolutionId);
  if (!resolution) {
    throw new Error('Resolution not found');
  }
  const updatedResolution = await resolution.update(updatedData);
  return updatedResolution;
};

module.exports = {
  getResolutions,
  getResolutionById,
  createResolution,
  updateResolution,
};
