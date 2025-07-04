import html2pdf from 'html2pdf.js';
import store from '../../redux/store';
import Logo from '../../assets/logo.gif';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';

const OrPDF = async ({ burnedArtifact, technicalService,repairOrder }) => {
  console.log(burnedArtifact, technicalService,repairOrder);

  await store.dispatch(fetchClientByAccountNumber(burnedArtifact?.SAC?.clientId));
  const client = store.getState().clients.client;


  try {
    const htmlTemplate = await fetch('OR/OR.html').then((res) => res.text());
    const mainContainer = document.createElement('div');
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = htmlTemplate;

   
    pageContainer.querySelector('#company-logo').src = Logo;
    pageContainer.querySelector('#sacId').textContent = burnedArtifact?.SAC?.id || 'N/A';
    pageContainer.querySelector('#repairOrderId').textContent = repairOrder?.id || 'N/A';
    pageContainer.querySelector('#claimant-name').textContent =
    burnedArtifact?.SAC?.claimantName || client?.holderName || 'N/A';
    pageContainer.querySelector('#client-name').textContent = client?.holderName || 'N/A';
    pageContainer.querySelector('#company-logo2').src = Logo;
    pageContainer.querySelector('#sacId2').textContent = burnedArtifact?.SAC?.id || 'N/A';
    pageContainer.querySelector('#repairOrderId2').textContent = repairOrder?.id || 'N/A';
    pageContainer.querySelector('#claimant-name2').textContent =
    burnedArtifact?.SAC?.claimantName || client?.holderName || 'N/A';
    pageContainer.querySelector('#client-name2').textContent = client?.holderName || 'N/A';

    pageContainer.querySelector('#artifact-name').textContent = burnedArtifact.name || 'N/A';
    pageContainer.querySelector('#artifact-brand').textContent = burnedArtifact.brand || '';
    pageContainer.querySelector('#artifact-model').textContent = burnedArtifact.model || '';
    pageContainer.querySelector('#repair-budget').textContent = repairOrder?.budget || '0.00';
    pageContainer.querySelector('#technical-report').textContent = repairOrder?.technicalReport || 'N/A';
    pageContainer.querySelector('#artifact-name2').textContent = burnedArtifact.name || 'N/A';
    pageContainer.querySelector('#artifact-brand2').textContent = burnedArtifact.brand || '';
    pageContainer.querySelector('#artifact-model2').textContent = burnedArtifact.model || '';
    pageContainer.querySelector('#repair-budget2').textContent = repairOrder?.budget || '0.00';
    pageContainer.querySelector('#technical-report2').textContent = repairOrder?.technicalReport || 'N/A';

    pageContainer.querySelector('#claimant-address').textContent =
    (client.address ? `${client.address}` : 'N/A');
    /* (client.address ? `${client.address} ${client.extraAddressInfo || ''}` : 'N/A'); */
    pageContainer.querySelector('#claimant-address2').textContent =
    (client.address ? `${client.address}` : 'N/A');
    /* (client.address ? `${client.address} ${client.extraAddressInfo || ''}` : 'N/A'); */

    pageContainer.querySelector('#claimant-phone').textContent =
    burnedArtifact?.SAC?.claimantPhone || client.phone || 'N/A';
    pageContainer.querySelector('#claimant-phone2').textContent =
    burnedArtifact?.SAC?.claimantPhone || client.phone || 'N/A';

    pageContainer.querySelector('#claimant-meter').textContent = client.device || 'N/A';
    pageContainer.querySelector('#claimant-category').textContent = client.category || 'N/A';
    pageContainer.querySelector('#claimant-meter2').textContent = client.device || 'N/A';
    pageContainer.querySelector('#claimant-category2').textContent = client.category || 'N/A';

 
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    pageContainer.querySelector('#current-date').textContent = `Caucete, San Juan, ${formattedDate}`;
    pageContainer.querySelector('#current-date2').textContent = `Caucete, San Juan, ${formattedDate}`;

    pageContainer.querySelector('#tech-name').textContent = technicalService.name || 'N/A';
    pageContainer.querySelector('#tech-type').textContent = technicalService.type
      ? technicalService.type.charAt(0).toUpperCase() + technicalService.type.slice(1)
      : 'N/A';
    pageContainer.querySelector('#tech-address').textContent = technicalService.address || 'N/A';
    pageContainer.querySelector('#tech-phone').textContent = technicalService.phone || 'N/A';
    pageContainer.querySelector('#tech-name2').textContent = technicalService.name || 'N/A';
    pageContainer.querySelector('#tech-type2').textContent = technicalService.type
      ? technicalService.type.charAt(0).toUpperCase() + technicalService.type.slice(1)
      : 'N/A';
    pageContainer.querySelector('#tech-address2').textContent = technicalService.address || 'N/A';
    pageContainer.querySelector('#tech-phone2').textContent = technicalService.phone || 'N/A';

    mainContainer.appendChild(pageContainer);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'OR/OR.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: 'Orden_Reparacion.pdf',
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

export default OrPDF;
