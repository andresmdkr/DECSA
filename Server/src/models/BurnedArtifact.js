const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('BurnedArtifact', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {  
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    },
    technicalService: {  
      type: DataTypes.STRING,
      allowNull: true,
    },
    technicalReport: {  
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conclusion: {  
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {  
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, { timestamps: false });
};
