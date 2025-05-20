const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define('TechnicalService', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('contratista', 'personal propio', 'redes'),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(100), 
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20), 
      allowNull: true,
    },
    area: {
      type: DataTypes.ENUM('artefactos', 'operaciones'),
      allowNull: true,
    }
  }, { timestamps: false });
};
