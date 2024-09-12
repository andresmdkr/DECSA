import jsPDF from 'jspdf';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import store from '../../redux/store'; // Asegúrate de tener acceso al store

const SacPDF = async (sacId) => {
  try {
    // Obtener la información de la SAC
    const sacResponse = await store.dispatch(fetchSACs({ sacId }));
    const sacData = sacResponse?.payload?.sacs?.length > 0 ? sacResponse.payload.sacs[0] : null;
    if (!sacData) {
      throw new Error('SAC no encontrada');
    }

    // Obtener la información del cliente
    const clientResponse = await store.dispatch(fetchClientByAccountNumber(sacData.clientId));
    const client = clientResponse?.payload;
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // Crear el PDF usando jsPDF
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });
    
    // Ajustes para el tamaño de fuente y espaciado
    const fontSize = 10; // Tamaño de fuente más pequeño
    const lineHeight = 7; // Espaciado entre líneas más compacto
    let y = 10; // Posición inicial en el eje Y

    doc.setFontSize(fontSize);

    // Función para agregar texto y manejar saltos de página
    const addText = (text, x, yPos) => {
      if (yPos > 290) { // Si sobrepasa el límite de la hoja, agregar nueva página
        doc.addPage();
        y = 10; // Reiniciar la posición vertical en la nueva página
      }
      doc.text(text, x, y);
      y += lineHeight; // Incrementar la posición vertical para el siguiente texto
    };

    // Datos del cliente
    addText('Solicitud de Atención al Cliente', 10, y);
    addText(`Número de Cuenta: ${client.accountNumber}`, 10, y);
    addText(`Número de Titular: ${client.holderNumber}`, 10, y);
    addText(`Nombre del Titular: ${client.holderName}`, 10, y);
    addText(`DNI: ${client.dni || 'N/A'}`, 10, y);
    addText(`Teléfono: ${client.phone || 'N/A'}`, 10, y);
    addText(`Teléfono Auxiliar: ${client.auxPhone || 'N/A'}`, 10, y);
    addText(`Dirección: ${client.address}`, 10, y);
    addText(`Info. Adicional Dirección: ${client.extraAddressInfo}`, 10, y);
    addText(`Dirección Postal: ${client.postalAddress}`, 10, y);
    addText(`Info. Adicional Postal: ${client.extraPostalAddressInfo}`, 10, y);
    addText(`Servicio: ${client.service}`, 10, y);
    addText(`Categoría: ${client.category}`, 10, y);
    addText(`Fecha de Ingreso: ${new Date(client.dateOfEntry).toLocaleDateString()}`, 10, y);
    addText(`Fecha de Terminación: ${client.dateOfTermination ? new Date(client.dateOfTermination).toLocaleDateString() : 'N/A'}`, 10, y);
    addText(`Dispositivo: ${client.device}`, 10, y);
    addText(`Zona: ${client.zone}`, 10, y);
    addText(`Sector: ${client.sector}`, 10, y);
    addText(`Ruta: ${client.route}`, 10, y);
    addText(`Suministro: ${client.supply}`, 10, y);
    addText(`Estado: ${client.status}`, 10, y);
    addText(`Voltaje: ${client.voltage}`, 10, y);
    addText(`Localidad: ${client.locality}`, 10, y);
    addText(`Departamento: ${client.department}`, 10, y);
    addText(`Provincia: ${client.province}`, 10, y);
    addText(`Subestación: ${client.substation}`, 10, y);
    addText(`Distribuidor: ${client.distributor}`, 10, y);
    addText(`Consumo 2024: ${client.consumption2024 || 'N/A'}`, 10, y);

    // Datos de la SAC
    addText('Datos de la SAC', 10, y);
    addText(`Número de SAC: ${sacData.id}`, 10, y);
    addText(`Motivo del Reclamo: ${sacData.claimReason}`, 10, y);
    addText(`Descripción: ${sacData.description}`, 10, y);
    addText(`Fecha del Evento: ${new Date(sacData.eventDate).toLocaleDateString()}`, 10, y);
    addText(`Hora de Inicio: ${sacData.startTime}`, 10, y);
    addText(`Hora de Fin: ${sacData.endTime}`, 10, y);
    addText(`Estado: ${sacData.status}`, 10, y);
    addText(`Prioridad: ${sacData.priority}`, 10, y);
    addText(`Área Encargada: ${sacData.area}`, 10, y);
    addText(`Creado: ${new Date(sacData.createdAt).toLocaleDateString()}`, 10, y);
    addText(`Actualizado: ${new Date(sacData.updatedAt).toLocaleDateString()}`, 10, y);

    // Artefactos quemados
    if (sacData.artifacts && sacData.artifacts.length > 0) {
      addText('Artefactos Quemados:', 10, y);
      sacData.artifacts.forEach((artifact, index) => {
        addText(`- ${artifact.name}: ${artifact.brand} ${artifact.model} (SN: ${artifact.serialNumber}), documentation: ${artifact.documentation}`, 10, y);
      });
    }

    // Guardar o abrir el PDF en una nueva ventana
    const pdfData = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfData);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error al generar el PDF:', error.message);
  }
};

export default SacPDF;
