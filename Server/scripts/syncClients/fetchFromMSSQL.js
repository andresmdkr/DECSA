require('dotenv').config();
const sql = require('mssql');

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

async function fetchFromMSSQL() {
  const pool = await sql.connect(sqlServerConfig);
  const result = await pool.request().query(`
    SELECT
      [Cuenta] AS accountNumber,
      [Nro Titular] AS holderNumber,
      [Titular] AS holderName,
      [Domicilio_Servicio] AS address,
      [Datos_Extr] AS extraAddressInfo,
      [Domicilio_1_Postal] AS postalAddress,
      [Datos_Ex_1] AS extraPostalAddressInfo,
      [Servicio] AS service,
      [Categoria] AS category,
      [Fecha_Alta] AS dateOfEntry,
      [Fecha_Baja] AS dateOfTermination,
      [Estado] AS status
    FROM [PR_CAU].[dbo].[INFO_CUENTAS]
    ORDER BY [Cuenta] ASC
  `);
  await pool.close();

  const normalizedData = result.recordset.map(row => ({
    ...row,
    status: row.status === 'DESCONEXION' ? 'BAJA' : row.status,
  }));

  return normalizedData;
}


module.exports = fetchFromMSSQL;
