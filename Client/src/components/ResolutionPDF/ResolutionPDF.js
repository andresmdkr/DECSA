import html2pdf from 'html2pdf.js';
import { fetchResolutions, fetchResolutionById } from '../../redux/slices/resolutionSlice';
import store from '../../redux/store';
import Logo from '../../assets/logo.gif';
import Sj from '../../assets/sj.png';

const ResolutionPDF = async (sacId, resolutionId, burnedArtifactId) => {
  try {
    console.log(sacId, resolutionId, burnedArtifactId);

    let resolutionResponse;
    let resolutionData;
    if (resolutionId) {
      resolutionResponse = await store.dispatch(fetchResolutionById(resolutionId));
      resolutionData = resolutionResponse.payload;
    } else {
      resolutionResponse = await store.dispatch(fetchResolutions({ sacId, burnedArtifactId }));
      resolutionData = resolutionResponse?.payload[0];
    }

    if (!resolutionData) throw new Error('Resolución no encontrada');

    const client = store.getState().clients.client;
    console.log(client, resolutionData);

    const htmlTemplate = await fetch('Resolution/Resolution.html').then((res) => res.text());

    const mainContainer = document.createElement('div');

    const currentDate = new Date();
    const formatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('es-AR', formatOptions);

    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;

    console.log(pageContainer);

    // Rellenar datos comunes
    pageContainer.querySelector('#logo-izq').src = Logo;
    pageContainer.querySelector('#logo-der').src = Sj;
    pageContainer.querySelector('#fechaActual').textContent = formattedDate;
    pageContainer.querySelector('#sacId').textContent = sacId || 'N/A';
    pageContainer.querySelector('#resolutionId').textContent = resolutionData.id || 'N/A';
    pageContainer.querySelector('#description').innerHTML =
      resolutionData.description.replace(/\n/g, '<br>').replace(/(<br>)([^<])/g, '$1<span class="indent">$2') || 'N/A';

    // Rellenar datos del cliente si existe
    if (client) {
      const fullAddress = `${client.address || ''} ${client.extraAddressInfo || ''}`.trim();
      pageContainer.querySelector('#holderName').textContent = client.holderName || 'N/A';
      pageContainer.querySelector('#supply').textContent = client.supply || 'N/A';
      pageContainer.querySelector('#address').textContent = fullAddress || 'N/A';
      pageContainer.querySelector('#department').textContent = client.department || 'N/A';
      pageContainer.querySelector('#province').textContent = client.province || 'N/A';
    }

    if (resolutionData.type === 'ReconocimientoIndemnizaciónConRecibo') {
      const budgetMatch = resolutionData.description.match(/\$(.*)/);
      const budget = budgetMatch ? budgetMatch[1].trim() : 'N/A';

      pageContainer.querySelector('#talonario').style.display = 'block';
      pageContainer.querySelector('#firma').style.display = 'none';
      pageContainer.querySelector('#logo').src = Logo;
      pageContainer.querySelector('#fechaActual2').textContent = formattedDate;
      pageContainer.querySelector('#presupuesto').textContent = `$${budget}`;
    }

    mainContainer.appendChild(pageContainer);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'Resolution/Resolution.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: 'Resolucion.pdf',
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

export default ResolutionPDF;
