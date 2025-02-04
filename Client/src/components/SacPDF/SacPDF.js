import html2pdf from 'html2pdf.js';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import Logo from '../../assets/logo.gif'

import store from '../../redux/store';

const SacPDF = async (sacId) => {
  try {
    const sacResponse = await store.dispatch(fetchSACs({ sacId }));
    const sacData = sacResponse?.payload?.sacs?.[0];
    if (!sacData) throw new Error('SAC no encontrada');

    const clientResponse = await store.dispatch(fetchClientByAccountNumber(sacData.clientId));
    const client = clientResponse?.payload;
    if (!client) throw new Error('Cliente no encontrado');

    const htmlTemplate = await fetch('SAC/SAC.html').then((res) => res.text());
    
    const mainContainer = document.createElement('div');

    const updatedAt = new Date(sacData.updatedAt);
    const formattedDate = updatedAt.toLocaleDateString('es-AR');
    const formattedTime = updatedAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

    const fullAddress = `${client.address || ''} ${client.extraAddressInfo || ''}`.trim();
    const fullPostalAddress = `${client.postalAddress || ''} ${client.extraPostalAddressInfo || ''}`.trim();

    const claimantName = sacData.claimantName || client.holderName;
    const claimantRelationship = sacData.claimantName ? sacData.claimantRelationship : 'Titular';

    const artifacts = sacData.artifacts || [];

    const pageContainers = [];  
    const artifactsPerPage = 3;

    if (artifacts.length > 0) {
      for (let i = 0; i < artifacts.length; i += 3) {
        const pageContainer = document.createElement('div');
        pageContainer.innerHTML = htmlTemplate;

        pageContainer.querySelector('#logo').src = Logo
        pageContainer.querySelector('#logo2').src = Logo
        pageContainer.querySelector('#sacId').textContent = sacData.id || 'N/A';
        pageContainer.querySelector('#talonarioId').textContent = sacData.id || 'N/A';
        pageContainer.querySelector('#accountNumber').textContent = client.accountNumber || 'N/A';
        pageContainer.querySelector('#holderName').textContent = client.holderName || 'N/A';
        pageContainer.querySelector('#device').textContent = client.device || 'N/A';
        pageContainer.querySelector('#category').textContent = client.category || 'N/A';
        pageContainer.querySelector('#substation').textContent = client.substation || 'N/A';
        pageContainer.querySelector('#supply').textContent = client.supply || 'N/A';
        pageContainer.querySelector('#claimantName').textContent = claimantName;
        pageContainer.querySelector('#claimantRelationship').textContent = claimantRelationship;
        pageContainer.querySelector('#talonarioAccountNumber').textContent = client.accountNumber || 'N/A';
        pageContainer.querySelector('#talonarioSupplyNumber').textContent = client.supply || 'N/A';
        pageContainer.querySelector('#talonarioClaimantName').textContent = claimantName;

        pageContainers.push(pageContainer);

        const claimantPhoneSection = pageContainer.querySelector('#claimantPhoneSection');
        if (sacData.claimantName) {
          pageContainer.querySelector('#claimantPhone').textContent = sacData.claimantPhone || '';
          claimantPhoneSection.style.display = 'flex';
        } else {
          claimantPhoneSection.style.display = 'none';
        }

        const claimReason = sacData.claimReason || '';
    
      
        const talonarioClaimReason = pageContainer.querySelector('#talonarioClaimReason');
        
        
        pageContainer.querySelectorAll('.checkbox').forEach(checkbox => {
          checkbox.textContent = '';
        });
        
        if ([
          'Sin Corriente', 'Acometida Cortada', 'Afectado a Corte Programado', 'Cables Cortados de BT o MT',
          'Columna al Caer', 'Falta de Fase', 'Problemas de Tensión', 'Incendio en LBT/LMT', 'Pilastra Electrificada',
          'Incendio en Puesto de Medición', 'Incendio en SETA', 'Medidor Quemado', 'Problema con el Alumbrado Público',
          'Problema en Acometida', 'Problema en Puesto de Medición', 'Rama sobre Cable o Acometida', 'Peligro de Electrocución',
          'Transformador Quemado'
        ].includes(claimReason)) {
          pageContainer.querySelector('#checkbox-electrical').textContent = 'X';
          talonarioClaimReason.textContent = claimReason;
        } else if (claimReason === 'Rotura de Artefactos') {
          pageContainer.querySelector('#checkbox-artifacts').textContent = 'X';
          talonarioClaimReason.textContent = 'Rotura de Artefacto/s';
        } else if ([
          'Reclamo de Facturación', 'Hurto de Energia', 'Reclamo Comercial', 'Otro problema comercial'
        ].includes(claimReason)) {
          pageContainer.querySelector('#checkbox-commercial').textContent = 'X';
          talonarioClaimReason.textContent = claimReason;
        } else {
          pageContainer.querySelector('#checkbox-other').textContent = 'X';
          talonarioClaimReason.textContent = {
            'Alumbrado Público': 'Alumbrado Público',
            'Apertura Distribuidor ET Caucete': 'Apertura Distribuidor ET Caucete',
            'Poste Quebrado': 'Poste Quebrado',
            'Falta de Poda': 'Falta de Poda',
            'Otros': 'Otros'
          }[claimReason] || 'Otros';
        }
        

        pageContainer.querySelector('#address').textContent = fullAddress || 'N/A';
        pageContainer.querySelector('#postalAddress').textContent = fullPostalAddress || 'N/A';
        pageContainer.querySelector('#phone').textContent = client.phone || ''; 
        pageContainer.querySelector('#description').textContent = sacData.description || 'N/A';
        pageContainer.querySelector('#date').textContent = `${formattedDate}`;
        pageContainer.querySelector('#time').textContent = `${formattedTime}`;
        pageContainer.querySelector('#talonarioDate').textContent = `${formattedDate}`;
        pageContainer.querySelector('#talonarioTime').textContent = `${formattedTime}`;

        const artifactsSection = pageContainer.querySelector('#artifacts');
        const talonarioArtifactsSection = pageContainer.querySelector('#talonarioArtifacts');
        artifactsSection.innerHTML = '';
        talonarioArtifactsSection.innerHTML = '';

        const artifactsChunk = artifacts.slice(i, i + 3);
        artifactsChunk.forEach(artifact => {
          const mainRow = document.createElement('tr');
          const nameCellMain = document.createElement('td');
          nameCellMain.textContent = artifact.name || 'N/A';
          mainRow.appendChild(nameCellMain);

          const brandModelSerialCellMain = document.createElement('td');
          brandModelSerialCellMain.textContent = `${artifact.brand || ''} ${artifact.model || ''} ${artifact.serialNumber || ''}`.trim();
          mainRow.appendChild(brandModelSerialCellMain);

          const documentationCellMain = document.createElement('td');
          documentationCellMain.textContent = artifact.documentation || 'N/A';
          mainRow.appendChild(documentationCellMain);

          artifactsSection.appendChild(mainRow);

          const talonarioRow = document.createElement('tr');
          const nameCellTalonario = document.createElement('td');
          nameCellTalonario.textContent = artifact.name || 'N/A';
          talonarioRow.appendChild(nameCellTalonario);

          const brandModelSerialCellTalonario = document.createElement('td');
          brandModelSerialCellTalonario.textContent = `${artifact.brand || ''} ${artifact.model || ''} ${artifact.serialNumber || ''}`.trim();
          talonarioRow.appendChild(brandModelSerialCellTalonario);

          talonarioArtifactsSection.appendChild(talonarioRow);
        });

        mainContainer.appendChild(pageContainer);
      }
    } else {
      const pageContainer = document.createElement('div');
      pageContainer.innerHTML = htmlTemplate;

      pageContainer.querySelector('#logo').src = Logo
      pageContainer.querySelector('#logo2').src = Logo
      pageContainer.querySelector('#sacId').textContent = sacData.id || 'N/A';
      pageContainer.querySelector('#talonarioId').textContent = sacData.id || 'N/A';
      pageContainer.querySelector('#accountNumber').textContent = client.accountNumber || 'N/A';
      pageContainer.querySelector('#holderName').textContent = client.holderName || 'N/A';
      pageContainer.querySelector('#device').textContent = client.device || 'N/A';
      pageContainer.querySelector('#category').textContent = client.category || 'N/A';
      pageContainer.querySelector('#substation').textContent = client.substation || 'N/A';
      pageContainer.querySelector('#supply').textContent = client.supply || 'N/A';
      pageContainer.querySelector('#claimantName').textContent = claimantName;
      pageContainer.querySelector('#claimantRelationship').textContent = claimantRelationship;
      pageContainer.querySelector('#talonarioAccountNumber').textContent = client.accountNumber || 'N/A';
      pageContainer.querySelector('#talonarioSupplyNumber').textContent = client.supply || 'N/A';
      pageContainer.querySelector('#talonarioClaimantName').textContent = claimantName;

      pageContainers.push(pageContainer);

      const claimantPhoneSection = pageContainer.querySelector('#claimantPhoneSection');
      if (sacData.claimantName) {
        pageContainer.querySelector('#claimantPhone').textContent = sacData.claimantPhone || '';
        claimantPhoneSection.style.display = 'flex';
      } else {
        claimantPhoneSection.style.display = 'none';
      }

      const claimReason = sacData.claimReason || '';
    
      
      const talonarioClaimReason = pageContainer.querySelector('#talonarioClaimReason');
      
      
      pageContainer.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.textContent = '';
      });
      
     
      if ([
        'Sin Corriente', 'Acometida Cortada', 'Afectado a Corte Programado', 'Cables Cortados de BT o MT',
        'Columna al Caer', 'Falta de Fase', 'Problemas de Tensión', 'Incendio en LBT/LMT', 'Pilastra Electrificada',
        'Incendio en Puesto de Medición', 'Incendio en SETA', 'Medidor Quemado', 'Problema con el Alumbrado Público',
        'Problema en Acometida', 'Problema en Puesto de Medición', 'Rama sobre Cable o Acometida', 'Peligro de Electrocución',
        'Transformador Quemado'
      ].includes(claimReason)) {
        pageContainer.querySelector('#checkbox-electrical').textContent = 'X';
        talonarioClaimReason.textContent = claimReason;
      } else if (claimReason === 'Rotura de Artefactos') {
        pageContainer.querySelector('#checkbox-artifacts').textContent = 'X';
        talonarioClaimReason.textContent = 'Rotura de Artefacto/s';
      } else if ([
        'Reclamo de Facturación', 'Hurto de Energia', 'Reclamo Comercial', 'Otro problema comercial'
      ].includes(claimReason)) {
        pageContainer.querySelector('#checkbox-commercial').textContent = 'X';
        talonarioClaimReason.textContent = claimReason;
      } else {
        pageContainer.querySelector('#checkbox-other').textContent = 'X';
        talonarioClaimReason.textContent = {
          'Alumbrado Público': 'Alumbrado Público',
          'Apertura Distribuidor ET Caucete': 'Apertura Distribuidor ET Caucete',
          'Poste Quebrado': 'Poste Quebrado',
          'Falta de Poda': 'Falta de Poda',
          'Otros': 'Otros'
        }[claimReason] || 'Otros';
      }
      
      
      
      pageContainer.querySelector('#address').textContent = fullAddress || 'N/A';
      pageContainer.querySelector('#postalAddress').textContent = fullPostalAddress || 'N/A';
      pageContainer.querySelector('#phone').textContent = client.phone || ''; 
      pageContainer.querySelector('#description').textContent = sacData.description || 'N/A';
      pageContainer.querySelector('#date').textContent = `${formattedDate}`;
      pageContainer.querySelector('#time').textContent = `${formattedTime}`;
      pageContainer.querySelector('#talonarioDate').textContent = `${formattedDate}`;
      pageContainer.querySelector('#talonarioTime').textContent = `${formattedTime}`;

      pageContainer.querySelector('#artifacts-section').style.display = 'none';
      pageContainer.querySelector('#talonario-artifacts-section').style.display = 'none';

      mainContainer.appendChild(pageContainer);
    }

    if(pageContainers.length > 1){
      pageContainers.forEach((pageContainer, index) => {
      pageContainer.querySelector('#page-number').style.display = 'block';
      pageContainer.querySelector('#page-number2').style.display = 'block';
      pageContainer.querySelector('#currentPage').textContent = index + 1;
      pageContainer.querySelector('#currentPage2').textContent = index + 1;
      pageContainer.querySelector('#totalPages').textContent = pageContainers.length;
      pageContainer.querySelector('#totalPages2').textContent = pageContainers.length;
      mainContainer.appendChild(pageContainer);  
    });}
   
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'SAC/SAC.css';
    mainContainer.appendChild(link);

    const options = {
      margin: 10,
      filename: 'Solicitud_Atencion_Cliente.pdf',
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

export default SacPDF;
