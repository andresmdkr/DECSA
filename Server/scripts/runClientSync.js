const {conn} = require('../src/db.js');
const fs = require('fs');
const path = require('path');
const { Client } = require('../src/db.js');
const fetchFromMSSQL = require('./syncClients/fetchFromMSSQL');
const fetchFromPostgres = require('./syncClients/fetchFromPostgres');
const mergeClientData = require('./syncClients/mergeClientData');
const syncToDatabase = require('./syncClients/syncToDatabase');

function logInfo(message) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
}

async function runClientSync() {
  logInfo('🚀 Iniciando sincronización de clientes...');

  console.time('⏱️ Tiempo total');
  
  try {
    console.time('🔌 Conexión Sequelize');
    await conn.authenticate();
    console.timeEnd('🔌 Conexión Sequelize');
    logInfo('✅ Sequelize conectado correctamente');

    let sqlData = [];
    let pgData = [];

    try {
      console.time('📥 Fetch SQL Server');
      sqlData = await fetchFromMSSQL();
      console.timeEnd('📥 Fetch SQL Server');
      logInfo(`✅ SQL Server: ${sqlData.length} registros obtenidos`);
    } catch (err) {
      logInfo(`⚠️ Error SQL Server: ${err.message}`);
    }

    try {
      console.time('📥 Fetch PostgreSQL');
      pgData = await fetchFromPostgres();
      console.timeEnd('📥 Fetch PostgreSQL');
      logInfo(`✅ PostgreSQL: ${pgData.length} registros obtenidos`);
    } catch (err) {
      logInfo(`⚠️ Error PostgreSQL: ${err.message}`);
    }

    if (!sqlData.length && !pgData.length) {
      logInfo('🚫 Sin datos de ninguna fuente. Abortando sincronización.');
      return;
    }

    console.time('🔗 Merge & Sync');
    const combined = mergeClientData(sqlData, pgData);

    const outputPath = path.join(__dirname, 'clientes_combinados.json');
    fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2), 'utf8');
    logInfo(`✅ Datos combinados guardados en: ${outputPath}`);
    await syncToDatabase(combined); 
    console.timeEnd('🔗 Merge & Sync');

    await conn.close();
    logInfo('🎉 Sincronización finalizada correctamente');
  } catch (error) {
    logInfo(`❌ Error general: ${error.message}`);
  }

  console.timeEnd('⏱️ Tiempo total');
}

runClientSync();
