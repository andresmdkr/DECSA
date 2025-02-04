import * as XLSX from 'xlsx';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import store from '../../redux/store';

const OpReportXLS = async (startDate, endDate) => {
  try {
    const startUTC = new Date(`${startDate}T00:00:00`).toISOString();
    const endUTC = new Date(`${endDate}T23:59:59`).toISOString();

    const response = await store.dispatch(
      fetchSACs({
        startDate: startUTC,
        endDate: endUTC,
        limit: -1,
      })
    );
    const sacs = response.payload?.sacs;

    if (!sacs || sacs.length === 0) {
      alert('No se encontraron SACs para las fechas seleccionadas');
      return;
    }

    const rows = [];
    for (const sac of sacs) {
      let client = null;

      try {
        const clientResponse = await store.dispatch(fetchClientByAccountNumber(sac.clientId));
        client = clientResponse?.payload;
      } catch (error) {
        console.warn(`Error al obtener el cliente para SAC ID ${sac.id}:`, error.message);
      }

      const artifacts = sac.artifacts || [];
      const artifactList = artifacts.map((artifact) => artifact.name || 'N/A').join(' // ');

      const claimantName = sac.claimantName || client?.holderName || 'N/A';
      const fullAddress = `${client?.address || ''} ${client?.extraAddressInfo || ''}`.trim();

      rows.push({
        'N° CUENTA': sac.clientId || 'N/A',
        'N° SUMINISTRO': client?.supply || 'N/A',
        'RECLAMANTE': claimantName,
        'RELACIÓN CON EL TITULAR': sac.claimantRelationship || 'Titular',
        'DOMICILIO SUMINISTRO': fullAddress || 'N/A',
        'N° RECLAMO': sac.id || 'N/A',
        'MOTIVO RECLAMO': sac.claimReason || 'N/A',
        'ARTEFACTOS RECLAMADOS': artifactList || 'N/A',
        'N° MEDIDOR': client?.device || 'N/A',
        'N° SETA': client?.substation || 'N/A',
        'Fecha Evento': sac.eventDate ? new Date(sac.eventDate).toLocaleDateString('es-AR') : 'N/A',
        'Hora Inicio': sac.startTime ? sac.startTime.slice(0, 5) : 'N/A',
        'Hora Fin': sac.endTime ? sac.endTime.slice(0, 5) : 'N/A',
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte SACs');

    const headers = [
      'N° CUENTA',
      'N° SUMINISTRO',
      'RECLAMANTE',
      'RELACIÓN CON EL TITULAR',
      'DOMICILIO SUMINISTRO',
      'N° RECLAMO',
      'MOTIVO RECLAMO',
      'ARTEFACTOS RECLAMADOS',
      'N° MEDIDOR',
      'N° SETA',
      'Fecha Evento',
      'Hora Inicio',
      'Hora Fin',
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // Ajustar el ancho de las columnas
    const columnWidths = headers.map(header => {
      return { wch: Math.max(header.length, ...rows.map(row => String(row[header]).length)) };
    });
    worksheet['!cols'] = columnWidths;

    const filename = `Reporte_SACs_${startDate}_hasta_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error al generar el archivo XLS:', error.message);
  }
};

export default OpReportXLS;
