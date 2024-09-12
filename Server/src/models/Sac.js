const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('SAC', {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    claimReason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
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
    },
    area: {
      type: DataTypes.STRING, 
    }
  });
}