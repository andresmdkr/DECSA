import ExcelJS from 'exceljs';

const OacXLSX = async ({ oacNumber, sac, client }) => {
  try {
    console.log(oacNumber, sac, client);
    const response = await fetch('OAC/OAC.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);

    const columnWidths = worksheet.columns.map(col => col.width);

    const now = new Date();
    const options = { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' };
    const [day, month, year] = new Intl.DateTimeFormat('es-AR', options)
      .format(now)
      .split('/'); // Divide la fecha en día, mes y año

    worksheet.getCell('H6').value = oacNumber; 
    worksheet.getCell('E10').value = client?.holderName || ''; 
/*     worksheet.getCell('E11').value = `${client?.address || ''} ${client?.extraAddressInfo || ''}`.trim();  */
    worksheet.getCell('E11').value = client?.address || '';
    worksheet.getCell('E13').value = client?.barrio || ''; 
    worksheet.getCell('E14').value = client?.supply || ''; 
    worksheet.getCell('O11').value = client?.device || ''; 
    worksheet.getCell('O12').value = `${sac?.claimReason || ''} / SAC N°: ${sac?.id || ''}`.trim(); 
    worksheet.getCell('O13').value = client?.accountNumber || ''; 
    worksheet.getCell('O14').value = client?.phone || ''; 


    worksheet.getCell('N9').value = day;
    worksheet.getCell('O9').value = month;
    worksheet.getCell('P9').value = year;
    
    worksheet.columns.forEach((col, i) => {
      col.width = columnWidths[i];
    });


    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error generando el archivo XLSX:', error);
    throw error;
  }
};

export default OacXLSX;
