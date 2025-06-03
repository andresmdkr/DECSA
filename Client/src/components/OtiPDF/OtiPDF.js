import html2pdf from 'html2pdf.js';
import OtiLogo from '../../assets/oti.png';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { fetchSACs } from '../../redux/slices/sacsSlice';

import store from '../../redux/store';

const OtiPDF = async (otiData, otiId,sacId) => {
  try {
    console.log('otiData', otiData, sacId);
    const sacResponse = await store.dispatch(fetchSACs({ sacId }));
    const sacData = sacResponse?.payload?.sacs?.[0];
    if (!sacData) throw new Error('SAC no encontrada');

    const clientResponse = await store.dispatch(fetchClientByAccountNumber(sacData.clientId));
    const client = clientResponse?.payload;
    if (!client) throw new Error('Cliente no encontrado');

    console.log('Client data:', client);

    const htmlTemplate = await fetch('OTI/OTI.html').then(res => res.text());
    const cssTemplate = await fetch('OTI/OTI.css').then(res => res.text());




    const formatDate = (dateString) => {
        if (!dateString || dateString === 'null') return '........./........./.........';
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      };


    const mainContainer = document.createElement('div');
    mainContainer.innerHTML = htmlTemplate;


    mainContainer.querySelector('#logo').src = OtiLogo;



    mainContainer.querySelector('.order-number').textContent = `N° ${otiId}` || 'N/A';
    mainContainer.querySelector('#date').textContent = formatDate(otiData.date) || ' ';
    mainContainer.querySelector('#realizado').textContent = formatDate(otiData.completionDate) || '........./........./.........'; 
    mainContainer.querySelector('#assignedTo').textContent =  otiData.assignedTo || '';


    mainContainer.querySelector('#sacIdContainer').textContent = sacId 
    ? `S.A.C Nº: ${sacId}`
    : '';

    if (client && typeof client === 'object' && client.holderName) {
      const clientInfo = mainContainer.querySelector('#clientInfo');
      clientInfo.style.display = 'flex';
      mainContainer.querySelector('#usuario').textContent = client.holderName;
      mainContainer.querySelector('#medidor').textContent = client.device || 'N/A';
    }

  



    const taskElement = mainContainer.querySelector('#task');
    taskElement.innerHTML = otiData.task?.trim()
      ? otiData.task
      : "....................................................................................................................................<br><br>....................................................................................................................................<br><br><br>";


    const locationElement = mainContainer.querySelector('#location');
    locationElement.innerHTML = otiData.location?.trim()
      ? otiData.location
      : "....................................................................................................................................<br><br><br>";


    const observationsElement = mainContainer.querySelector('#observations');
    observationsElement.innerHTML = otiData.observations?.trim()
      ? otiData.observations
      : ".................................................................................................................................<br><br>.................................................................................................................................<br><br><br>";


    const styleTag = document.createElement('style');
    styleTag.textContent = cssTemplate;
    mainContainer.prepend(styleTag);

    const options = {
      margin: 10,
      filename: `Orden_Trabajo_${otiId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, backgroundColor: null },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    };


    const pdfBlob = await html2pdf().set(options).from(mainContainer).output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error al generar el PDF:', error.message);
  }
};

export default OtiPDF;
