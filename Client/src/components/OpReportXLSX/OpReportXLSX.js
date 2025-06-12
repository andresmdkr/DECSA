import * as XLSX from 'xlsx';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import store from '../../redux/store';

const OpReportXLS = async (startDate, endDate, clientId, substationFilter) => {
  try {
    const startUTC = new Date(`${startDate}T00:00:00`).toISOString();
    const endUTC = new Date(`${endDate}T23:59:59`).toISOString();

    const response = await store.dispatch(
      fetchSACs({
        startDate: startUTC,
        endDate: endUTC,
        clientId: clientId?.trim() || null,
        limit: -1,
      })
    );
    let sacs = Array.isArray(response.payload?.sacs) ? response.payload.sacs : [];

    if (sacs.length === 0) {
      alert('No se encontraron SACs para las fechas seleccionadas');
      return;
    }

    let filteredSACs = [];

    for (const sac of sacs) {
      if (!sac || typeof sac !== 'object') continue;
      
      let client = null;
      try {
        if (sac.clientId) {
          const clientResponse = await store.dispatch(fetchClientByAccountNumber(sac.clientId));
          client = clientResponse?.payload || null;
          
        }
        
        if (!substationFilter || (client && client.substation === substationFilter)) {
          filteredSACs.push({ ...sac, client });
        }
      } catch (error) {
        console.warn(`Error al obtener el cliente para SAC ID ${sac.id}:`, error.message);
      }
    }

    if (filteredSACs.length === 0) {
      alert('No se encontraron SACs para la SETA ingresada');
      return;
    }
    const rows = filteredSACs.map(sac => ({
      'N° RECLAMO': sac.id || 'N/A',
      'Fecha Reclamo': sac.createdAt ? new Date(sac.createdAt).toLocaleDateString('es-AR') : 'N/A',
      'Hora reclamo': sac.startTime ? sac.startTime.slice(0, 5) : 'N/A',
      'N° CUENTA': sac.clientId || 'N/A',
      'RECLAMANTE': sac.claimantName || sac.client?.holderName || 'N/A',  
      'N° SUMINISTRO': sac.client?.supply || 'N/A',
      'RELACIÓN CON EL TITULAR': sac.claimantRelationship || 'Titular',
/*       'DOMICILIO SUMINISTRO': `${sac.client?.address || ''} ${sac.client?.extraAddressInfo || ''}`.trim(), */
      'DOMICILIO SUMINISTRO': sac.client?.address || 'N/A',
      'DEPARTAMENTO': sac.client?.department || 'N/A',
      'DISTRIBUIDOR': sac.client?.distributor || 'N/A',
      'N° SETA': sac.client?.substation || 'N/A',
      'N° MEDIDOR': sac.client?.device || 'N/A',
      'MOTIVO RECLAMO': sac.claimReason || 'N/A',
      'ARTEFACTOS RECLAMADOS': (sac.artifacts || []).map(a => a?.name || 'N/A').join(' // '),

    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte SACs');

    const headers = Object.keys(rows[0]);
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    
    worksheet['!cols'] = headers.map(header => ({
      wch: Math.max(header.length, ...rows.map(row => String(row[header] || '').length))
    }));

    const filename = `Reporte_SACs_${startDate}_hasta_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error al generar el archivo XLS:', error.message);
  }
};


export default OpReportXLS;
