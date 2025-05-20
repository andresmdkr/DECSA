const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('SAC', {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    claimReason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: true,  
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,  
      defaultValue: 'Pending',  
    },
    priority: {
      type: DataTypes.STRING, 
      defaultValue: 'baja', 
    },
    area: {
      type: DataTypes.STRING, 
    },
    claimantName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    claimantRelationship: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    claimantPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    closeDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closeTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    closedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, { timestamps: true });
}
