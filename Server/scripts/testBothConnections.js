require('dotenv').config();
const fs = require('fs'); 
const sql = require('mssql');
const { Client } = require('pg');

const sqlServerConfig = {
  user: process.env.SQLSRV_USER,
  password: process.env.SQLSRV_PASSWORD,
  server: process.env.SQLSRV_HOST,
  port: parseInt(process.env.SQLSRV_PORT || "1433", 10),
  database: process.env.SQLSRV_DB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function testBothConnections() {
  try {
    console.log("🔌 Conectando a SQL Server...");
    const sqlPool = await sql.connect(sqlServerConfig);

    const sqlResult = await sqlPool.request().query(`
      SELECT TOP 100
        [Cuenta] AS "accountNumber",
        [Nro Titular] AS "holderNumber",
        [Titular] AS "holderName",
        [Domicilio_Servicio] AS "address",
        [Datos_Extr] AS "extraAddressInfo",
        [Domicilio_1_Postal] AS "postalAddress",
        [Datos_Ex_1] AS "extraPostalAddressInfo",
        [Servicio] AS "service",
        [Categoria] AS "category",
        [Fecha_Alta] AS "dateOfEntry",
        [Fecha_Baja] AS "dateOfTermination",
        [Estado] AS "status"
      FROM [PR_CAU].[dbo].[INFO_CUENTAS]
      ORDER BY [Cuenta] ASC
    `);
    console.log("✅ SQL Server OK.");

    console.log("🔌 Conectando a PostgreSQL...");
    const pgClient = new Client({
      user: process.env.PG2_USER,
      host: process.env.PG2_HOST,
      database: process.env.PG2_NAME,
      password: process.env.PG2_PASSWORD,
      port: parseInt(process.env.PG2_PORT || "5432", 10),
    });

    await pgClient.connect();
    const pgResult = await pgClient.query(`
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
      LIMIT 100
    `);
    console.log("✅ PostgreSQL OK.");

    // Combinar por accountNumber
    const combined = sqlResult.recordset.map(sqlRow => {
      const match = pgResult.rows.find(pgRow => String(pgRow.accountNumber) === String(sqlRow.accountNumber));
      return { ...sqlRow, ...(match || {}) };
    });

    console.log("🔗 Mostrando los primeros 10 combinados:");
    console.table(combined.slice(0, 10));

    // 📝 Guardar en archivo JSON
    fs.writeFileSync('output.json', JSON.stringify(combined, null, 2), 'utf-8');
    console.log("📁 Archivo guardado como 'output.json'");

    await sqlPool.close();
    await pgClient.end();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testBothConnections();