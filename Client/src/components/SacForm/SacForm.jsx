import React from 'react';
import styles from './SacForm.module.css';

const SacForm = ({ client, onClose }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>Detalles de Reclamo</h2>
                <div className={styles.details}>
                    <p><strong>Número de Cuenta:</strong> {client.accountNumber}</p>
                    <p><strong>Nombre Titular:</strong> {client.holderName}</p>
                    <p><strong>Dirección:</strong> {client.address} {client.extraAddressInfo}</p>
                    <p><strong>Categoría:</strong> {client.category}</p>
                    <p><strong>Dispositivo:</strong> {client.device}</p>
                </div>
                <div className={styles.textareaContainer}>
                    <label htmlFor="claimDetails">Detalles del Reclamo:</label>
                    <textarea id="claimDetails" className={styles.textarea} placeholder="Describe el reclamo aquí..."></textarea>
                </div>
                <button className={styles.submitButton}>Enviar Reclamo</button>
            </div>
        </div>
    );
};

export default SacForm;
