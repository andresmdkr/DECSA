const { RepairOrder } = require('../db.js');

const createRepairOrder = async (data) => {
  const { burnedArtifactId, technicalService, budget, technicalReport } = data;

  const newOrder = await RepairOrder.create({
    burnedArtifactId,
    technicalService,
    budget,
    technicalReport,
  });
  return newOrder;
};

const getRepairOrder = async (burnedArtifactId) => {
  const repairOrder = await RepairOrder.findOne({
      where: { burnedArtifactId },
  });
  return repairOrder || null;
};


const updateRepairOrder = async (id, data) => {
  const repairOrder = await RepairOrder.findByPk(id);
  if (!repairOrder) throw new Error('Repair order not found');

  const { technicalService, budget, technicalReport } = data;

  repairOrder.technicalService = technicalService || repairOrder.technicalService;
  repairOrder.budget = budget || repairOrder.budget;
  repairOrder.technicalReport = technicalReport || repairOrder.technicalReport;

  await repairOrder.save();
  console.log(repairOrder)
  return repairOrder;
};

module.exports = {
  createRepairOrder,
  getRepairOrder,
  updateRepairOrder,
};
