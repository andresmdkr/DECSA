require('dotenv').config();
const { Client } = require('../../src/db.js');

async function syncToDatabase(combinedClients) {
  let count = 0;

 for (const client of combinedClients) {
  try {
    const { id, ...rest } = client;
    const cleanAccountNumber = String(client.accountNumber).trim();

    if (cleanAccountNumber !== '0' && cleanAccountNumber !== '') {
      const existing = await Client.findOne({ where: { accountNumber: cleanAccountNumber } });

      if (existing) {
        const fieldsToUpdate = {};
        for (const key in rest) {
          if (rest[key] !== undefined && rest[key] !== null) {
            fieldsToUpdate[key] = rest[key];
          }
        }

        await existing.update(fieldsToUpdate);
      } else {
        await Client.create({ accountNumber: cleanAccountNumber, ...rest });
      }

      count++;
      if (count % 100 === 0) {
        console.log(`🧮 Procesados: ${count}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error al sincronizar cliente ${client.accountNumber}:`, err.message);
  }
}


  console.log(`✅ Sincronizados ${count} registros.`);
}

module.exports = syncToDatabase;
