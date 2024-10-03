const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Resolution', {
    type: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, 
    },
    clientNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  });
}