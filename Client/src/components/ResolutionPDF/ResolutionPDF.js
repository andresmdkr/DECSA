import html2pdf from 'html2pdf.js';
import { fetchResolutions } from '../../redux/slices/resolutionSlice';
import store from '../../redux/store';

const ResolutionPDF = async (sacId, resolutionId, burnedArtifactId) => {
  try {
    console.log(sacId, resolutionId, burnedArtifactId);

    const resolutionResponse = await store.dispatch(fetchResolutions({ sacId, burnedArtifactId }));
    const resolutionData = resolutionResponse?.payload[0];
    if (!resolutionData) throw new Error('Resolución no encontrada');

    const client = store.getState().clients.client;
    if (!client) throw new Error('Cliente no encontrado');

    console.log(client, resolutionData )

    const htmlTemplate = await fetch('/Resolution/Resolution.html').then((res) => res.text());
    
    const mainContainer = document.createElement('div');

    // Formatear la dirección
    const fullAddress = `${client.address || ''} ${client.extraAddressInfo || ''}`.trim();
    
    // Crear la sección del PDF
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;

    

    // Rellenar los datos en el HTML
    pageContainer.querySelector('#holderName').textContent = client.holderName || 'N/A';
    pageContainer.querySelector('#supply').textContent = client.supply || 'N/A';
    pageContainer.querySelector('#address').textContent = fullAddress || 'N/A';
    pageContainer.querySelector('#department').textContent = client.department || 'N/A';
    pageContainer.querySelector('#province').textContent = client.province || 'N/A';
    pageContainer.querySelector('#sacId').textContent = sacId || 'N/A';
    pageContainer.querySelector('#resolutionId').textContent = resolutionData.id || 'N/A';
    pageContainer.querySelector('#description').innerHTML = resolutionData.description
    .replace(/\n/g, '<br>')
    .replace(/(<br>)([^<])/g, '$1<span class="indent">$2')
    || 'N/A'; 



    mainContainer.appendChild(pageContainer);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Resolution/Resolution.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: 'Resolucion.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const pdfBlob = await html2pdf().set(options).from(mainContainer).output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

  } catch (error) {
    console.error('Error al generar el PDF:', error.message);
  }
};

export default ResolutionPDF;
