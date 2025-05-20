import html2pdf from 'html2pdf.js';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import store from '../../redux/store';


const OpReportPDF = async (startDate, endDate, clientId, substationFilter) => {
  console.log(substationFilter)
  try {
    const startUTC = new Date(`${startDate}T00:00:00`).toISOString();
    const endUTC = new Date(`${endDate}T23:59:59`).toISOString();

    // Obtener todas las SACs en el rango de fechas
    const response = await store.dispatch(
      fetchSACs({
        startDate: startUTC,
        endDate: endUTC,
        clientId: clientId?.trim() || null,
        limit: -1,
      })
    );
    let sacs = response.payload?.sacs;

    if (!sacs || sacs.length === 0) {
      alert('No se encontraron SACs para las fechas seleccionadas');
      throw new Error('No se encontraron SACs para las fechas seleccionadas');
    }

    // 🚀 **Obtener los clientes de cada SAC y filtrar por Substation**
    let filteredSACs = [];

    for (const sac of sacs) {
      try {
        // Obtener el cliente asociado a la SAC
        const clientResponse = await store.dispatch(fetchClientByAccountNumber(sac.clientId));
        const client = clientResponse?.payload;

        // Filtrar por substation si el usuario ingresó un valor
        if (!substationFilter || (client?.substation === substationFilter)) {
          filteredSACs.push({ ...sac, client });
        }
      } catch (error) {
        console.warn(`Error al obtener el cliente para SAC ID ${sac.id}:`, error.message);
      }
    }

    if (filteredSACs.length === 0) {
      alert('No se encontraron SACs para la SETA ingresada');
      throw new Error('No se encontraron SACs para la SETA ingresada');
    }

    // Cargar la plantilla HTML
    const htmlTemplate = await fetch('OpReportPDF/OpReportPDF.html').then(res => res.text());
    const mainContainer = document.createElement('div');
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;
    const tableBody = pageContainer.querySelector('#artifact-report-table-body');

    for (const { sac, client } of filteredSACs.map(s => ({ sac: s, client: s.client }))) {
      const row = document.createElement('tr');
      const columns = {
        accountNumber: sac.clientId || 'N/A',
        supply: client?.supply || 'N/A',
        claimantName: sac.claimantName || client?.holderName || 'N/A',
        claimantRelationship: sac.claimantName ? sac.claimantRelationship : 'Titular',
        fullAddress: `${client?.address || ''} ${client?.extraAddressInfo || ''}`.trim(),
        claimNumber: sac.id || 'N/A',
        claimReason: sac.claimReason || 'N/A',
        device: client?.device || 'N/A',
        substation: client?.substation || 'N/A',
        eventDate: sac.eventDate ? new Date(sac.eventDate).toLocaleDateString('es-AR') : 'N/A',
        startTime: sac.startTime ? sac.startTime.slice(0, 5) : 'N/A',
      };

      Object.entries(columns).forEach(([key, value]) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    }

    pageContainer.querySelector('#artifact-report-date-range').textContent = `Reporte del ${startDate} al ${endDate}`;

    mainContainer.appendChild(pageContainer);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'OpReportPDF/OpReportPDF.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: `Reporte_SACs_${startDate}_to_${endDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const pdfBlob = await html2pdf().set(options).from(mainContainer).output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error al generar el PDF:', error.message);
  }
};

export default OpReportPDF;
