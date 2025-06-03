const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('InternalWorkOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Open',
    },
    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completionDate: {  
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    isDerived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sacId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SACs',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  });
};
