// src/components/OtTemplate.js
import React from 'react';
import styles from './OtTemplate.module.css';

const OtTemplate = ({ client, sacData }) => {
  return (
    <div id="pdfContent" className={styles.pdfContent}>
      <h2 className={styles.title}>Solicitud de Atención al Cliente</h2>
      <p><strong>Número de Cuenta:</strong> {client.accountNumber}</p>
      <p><strong>Nombre del Titular:</strong> {client.holderName}</p>
      <p><strong>DNI:</strong> {client.dni || 'N/A'}</p>
      <p><strong>Teléfono:</strong> {client.phone || 'N/A'}</p>
      <p><strong>Dirección:</strong> {client.address}</p>
      <p><strong>Estado del SAC:</strong> {sacData.status}</p>
      <p><strong>Descripción:</strong> {sacData.description}</p>
      <p><strong>Fecha del Evento:</strong> {new Date(sacData.eventDate).toLocaleDateString()}</p>
    </div>
  );
};

export default OtTemplate;
