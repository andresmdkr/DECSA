const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('RepairOrder', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    technicalService: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    budget: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    technicalReport: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, { timestamps: true });
};
