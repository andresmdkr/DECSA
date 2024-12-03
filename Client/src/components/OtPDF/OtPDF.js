import html2pdf from 'html2pdf.js';
import store from '../../redux/store';
import Logo from '../../assets/logo.gif';


function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


const OtPDF = async ({ sac, ot, artifact }) => {
  const client = store.getState().clients.client;

  try {
    const htmlTemplate = await fetch('OT/OT.html').then((res) => res.text());
    const mainContainer = document.createElement('div');
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;

    // Rellenar información del encabezado
    pageContainer.querySelector('#company-logo').src = Logo;
    pageContainer.querySelector('#otId').textContent = ot.id || 'N/A';
    pageContainer.querySelector('#sacId').textContent = sac.id || artifact.SAC?.id || 'N/A';

    // Rellenar información del servicio técnico y cliente
    pageContainer.querySelector('#technicalService').textContent = ot.technicalService || 'N/A';
    pageContainer.querySelector('#otDate').textContent = ot.createdAt ? formatDate(ot.createdAt) : 'N/A';
    pageContainer.querySelector('#holderName').textContent = client.holderName || 'N/A';
    pageContainer.querySelector('#supply').textContent = client.supply || 'N/A';
    pageContainer.querySelector('#claimantName').textContent = sac.claimantName || client.holderName || 'N/A';
    pageContainer.querySelector('#eventDate').textContent = sac.eventDate ? formatDate(sac.eventDate) : 'N/A';
    pageContainer.querySelector('#address').textContent = `${client.address} ${client.extraAddressInfo}`;
    pageContainer.querySelector('#claimantPhone').textContent = sac.claimantPhone || client.phone || 'N/A';

    if (artifact) {
      const artifactTable = pageContainer.querySelector('#artifact-table');
      artifactTable.style.display = 'block';
      pageContainer.querySelector('#artifact-name').textContent = artifact.name || 'N/A';
      pageContainer.querySelector('#artifact-details').textContent = 
        `${artifact.brand || 'N/A'} / ${artifact.model || 'N/A'} / ${artifact.serialNumber || 'N/A'}`;
    }

        const subtitle = pageContainer.querySelector('#conditional-subtitle');
        const descriptionText = pageContainer.querySelector('#description-text');

        if (subtitle) {
          subtitle.textContent = artifact ? "INFORME Y OBSERVACIONES" : "ORDEN DE TRABAJO";
        }

        if (descriptionText) {
          descriptionText.textContent = ot.description || '';
        }

    
    mainContainer.appendChild(pageContainer);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'OT/OT.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: 'Orden_Trabajo.pdf',
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

export default OtPDF;