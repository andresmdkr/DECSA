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
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('contratista', 'personal propio'),
      allowNull: false,
    }
  }, { timestamps: false });
};
