require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST,DB_NAME,
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
  logging: false, 
  native: false, 
  pool: {
    max: 30,     
    min: 5,       
    acquire: 60000,  
    idle: 10000   
  }
});

const basename = path.basename(__filename);
const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });


modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

const {User, Client,SAC,BurnedArtifact,CustomerServiceOrder, WorkOrder, Resolution} = sequelize.models;

// RELACIONES
Client.hasMany(SAC, { foreignKey: 'clientId' });
SAC.belongsTo(Client, { 
  foreignKey: 'clientId',
  allowNull: true 
});

SAC.hasMany(BurnedArtifact, { foreignKey: 'sacId', as: 'artifacts' });
BurnedArtifact.belongsTo(SAC, { foreignKey: 'sacId' });

Client.hasMany(BurnedArtifact, { foreignKey: 'clientId', as: 'burnedArtifacts' });
BurnedArtifact.belongsTo(Client, { foreignKey: 'clientId' });

SAC.hasMany(CustomerServiceOrder, { foreignKey: 'sacId', as: 'customerServiceOrders' });
CustomerServiceOrder.belongsTo(SAC, { foreignKey: 'sacId' });

SAC.hasMany(WorkOrder, { foreignKey: 'sacId', as: 'workOrders' });
WorkOrder.belongsTo(SAC, { foreignKey: 'sacId', allowNull: true });

BurnedArtifact.hasOne(WorkOrder, { foreignKey: 'burnedArtifactId' });
WorkOrder.belongsTo(BurnedArtifact, { foreignKey: 'burnedArtifactId', allowNull: true });

SAC.hasOne(Resolution, { foreignKey: 'sacId', as: 'resolution' });
Resolution.belongsTo(SAC, { foreignKey: 'sacId' });

module.exports = {
  ...sequelize.models, 
  conn: sequelize,   
};
