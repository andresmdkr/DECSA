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
  }, { timestamps: false });
};
