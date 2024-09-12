const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('CustomerServiceOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending', 
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: true, 
    },
    resolution: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    resolutionDate: {
      type: DataTypes.DATE,
      allowNull: true, 
    },
    assignedTechnician: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING), 
      allowNull: true,
    },
  },
  {
    timestamps: true, 
  });
};
