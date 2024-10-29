const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('WorkOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'In Progress',  
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,  
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,  
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING),  
      allowNull: true,
    },
    technicalService: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sacId: {
      type: DataTypes.INTEGER,
      allowNull: true,  
      references: {
        model: 'SACs',  
        key: 'id',
      },
    },
    burnedArtifactId: {
      type: DataTypes.INTEGER,
      allowNull: true,  
      references: {
        model: 'BurnedArtifacts',  
        key: 'id',
      },
    },
  },
  {
    timestamps: true,  
  });
};
