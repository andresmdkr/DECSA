import html2pdf from 'html2pdf.js';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import store from '../../redux/store';


const ArtifactReportPDF = async (startDate, endDate) => {
  try {
    const startUTC = new Date(`${startDate}T00:00:00`).toISOString();
    const endUTC = new Date(`${endDate}T23:59:59`).toISOString();


    const response = await store.dispatch(
      fetchSACs({
        startDate: startUTC,
        endDate: endUTC,
        claimReason: 'Rotura de Artefactos',
        limit: -1,
      })
    );
    const sacs = response.payload?.sacs;

    if (!sacs || sacs.length === 0) {
      alert('No se encontraron SACs para las fechas seleccionadas');
      throw new Error('No se encontraron SACs para las fechas seleccionadas');
    }

    // Cargar la plantilla HTML
    const htmlTemplate = await fetch('ArtifactReportPDF/ArtifactReportPDF.html').then((res) => res.text());
    const mainContainer = document.createElement('div');
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;

    const tableBody = pageContainer.querySelector('#artifact-report-table-body');
 
    for (const sac of sacs) {
        let client = null;
        
        try {
          // Intentar obtener el cliente asociado al SAC
          const clientResponse = await store.dispatch(fetchClientByAccountNumber(sac.clientId));
          client = clientResponse?.payload;
        } catch (error) {
          console.warn(`Error al obtener el cliente para SAC ID ${sac.id}:`, error.message);
        }
      
  
        const artifacts = sac.artifacts || [];
        const artifactList = artifacts.map((artifact) => artifact.name || 'N/A').join(' // ');
      
        const claimantName = sac.claimantName || client?.holderName || 'N/A';
        const claimantRelationship = sac.claimantName ? sac.claimantRelationship : 'Titular';
        const fullAddress = `${client?.address || ''} ${client?.extraAddressInfo || ''}`.trim();
      
        // Crear una fila en la tabla
        const row = document.createElement('tr');
        const columns = {
          accountNumber: sac.clientId || 'N/A', // Número de cuenta
          supply: client?.supply || 'N/A', // Número de suministro
          claimantName: claimantName || 'N/A', // Reclamante
          fullAddress: fullAddress || 'N/A', // Domicilio suministro
          claimNumber: sac.id || 'N/A', // Número de reclamo
          claimDate: sac.createdAt ? new Date(sac.createdAt).toLocaleDateString('es-AR') : 'N/A', // Fecha reclamo
          artifacts: artifactList || 'N/A', // Artefactos reclamados
          device: client?.device || 'N/A', // Número de medidor
          substation: client?.substation || 'N/A', // Número de SETA
          eventDate: sac.eventDate ? new Date(sac.eventDate).toLocaleDateString('es-AR') : 'N/A', // Fecha evento
          startTime: sac.startTime ? sac.startTime.slice(0, 5) : 'N/A', // Hora inicio
          endTime: sac.endTime ? sac.endTime.slice(0, 5) : 'N/A', // Hora fin
        };
      
        // Rellenar las celdas con los datos
        Object.entries(columns).forEach(([key, value]) => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);

        });

    
        if (!tableBody) {
          throw new Error('No se encontró el elemento #artifact-report-table-body en la plantilla HTML.');
        }
        
        // Agregar la fila al cuerpo de la tabla
        tableBody.appendChild(row);
      }
      


    pageContainer.querySelector('#artifact-report-date-range').textContent = `Reporte del ${startDate} al ${endDate}`;

    mainContainer.appendChild(pageContainer);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'ArtifactReportPDF/ArtifactReportPDF.css';
    mainContainer.appendChild(link);


    const options = {
      margin: 10,
      filename: `Reporte_SACs_${startDate}_to_${endDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generación del PDF
    const pdfBlob = await html2pdf().set(options).from(mainContainer).output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error al generar el PDF:', error.message);
  }
};

export default ArtifactReportPDF;
