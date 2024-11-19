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
      defaultValue: 'Open',
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    issueTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignmentTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oacReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pendingTasks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    tension: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
    performedWork: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
  },
  {
    timestamps: true,
  });
};
