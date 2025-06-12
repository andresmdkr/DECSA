function normalizeAccountNumber(value) {
  return String(value).trim().replace(/^0+/, ''); // Elimina espacios y ceros iniciales
}

function mergeClientData(sqlData, pgData) {
  // DEBUG: Mostrar 10 claves de pgData
  console.log("🔍 Claves de pgData (normalizadas):");
  pgData.slice(0, 10).forEach(row => {
    console.log(" -", normalizeAccountNumber(row.accountNumber));
  });

  // Crear mapa de pgData con claves normalizadas
  const pgMap = new Map(
    pgData.map(row => [normalizeAccountNumber(row.accountNumber), row])
  );

  // DEBUG: Verificar qué claves vienen de SQL Server
  console.log("🔍 Claves de sqlData (primeras 10):");
  sqlData.slice(0, 10).forEach(row => {
    console.log(" *", normalizeAccountNumber(row.accountNumber), "(original:", row.accountNumber, ")");
  });

  // Unión y búsqueda
  return sqlData.map(sqlRow => {
    const key = normalizeAccountNumber(sqlRow.accountNumber);
    const pgRow = pgMap.get(key);


    return { ...sqlRow, ...(pgRow || {}) };
  });
}

module.exports = mergeClientData;
