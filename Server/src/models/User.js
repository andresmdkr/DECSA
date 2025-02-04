const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'Admin',
        'Atencion al cliente',
        'Artefactos Quemados',
        'Operaciones',
        'Comercial'
      ),
      defaultValue: 'Atencion al cliente', 
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active',
      allowNull: false,
    }
  }, { timestamps: false });};



