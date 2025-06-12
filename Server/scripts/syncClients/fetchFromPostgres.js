require('dotenv').config();
const { Client } = require('pg');

async function fetchFromPostgres() {
  const pgClient = new Client({
    user: process.env.PG2_USER,
    host: process.env.PG2_HOST,
    database: process.env.PG2_NAME,
    password: process.env.PG2_PASSWORD,
    port: parseInt(process.env.PG2_PORT || "5432", 10),
  });

  await pgClient.connect();

  const result = await pgClient.query(`
   SELECT
      cuenta AS "accountNumber",
      dispositiv AS "device",
      zona AS "zone",
      sector,
      recorrido AS "route",
      suministro AS "supply",
      tension AS "voltage",
      "wgs84-long" AS "wsg84Long",
      "wgs84-lati" AS "wsg84Lati",
      localidad AS "locality",
      departamen AS "department",
      provincia AS "province",
      seta AS "substation",
      distribuid AS "distributor",
      salida_bt AS "outputBT",
      acometida AS "connection"
    FROM decsa_app.usuarios
    ORDER BY cuenta ASC
  `);

  await pgClient.end();
  return result.rows;
}

module.exports = fetchFromPostgres;
