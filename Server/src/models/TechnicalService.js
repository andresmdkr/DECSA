const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define('TechnicalService', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('contratista', 'personal propio'),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(100), 
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20), 
      allowNull: true,
    }
  }, { timestamps: false });
};
