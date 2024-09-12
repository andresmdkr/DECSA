import React, { useState } from 'react';
import styles from './ArtifactModal.module.css';

const ArtifactModal = ({ onClose, onAdd, onEdit, artifactToEdit }) => {
    const [artifactName, setArtifactName] = useState(artifactToEdit?.name || '');
    const [artifactBrand, setArtifactBrand] = useState(artifactToEdit?.brand || '');
    const [artifactModel, setArtifactModel] = useState(artifactToEdit?.model || '');
    const [artifactSerialNumber, setArtifactSerialNumber] = useState(artifactToEdit?.serialNumber || '');
    const [artifactDocumentation, setArtifactDocumentation] = useState(artifactToEdit?.documentation || '');

    const handleSave = () => {
        const artifactData = {
            name: artifactName,
            brand: artifactBrand,
            model: artifactModel,
            serialNumber: artifactSerialNumber,
            documentation: artifactDocumentation,
        };

        if (artifactToEdit) {
            onEdit(artifactData);
        } else {
            onAdd(artifactData);
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            switch (e.target.name) {
                case 'artifactName':
                    document.getElementById('artifactBrand').focus();
                    break;
                case 'artifactBrand':
                    document.getElementById('artifactModel').focus();
                    break;
                case 'artifactModel':
                    document.getElementById('artifactSerialNumber').focus();
                    break;
                case 'artifactSerialNumber':
                    document.getElementById('artifactDocumentation').focus();
                    break;
                case 'artifactDocumentation':
                    handleSave();
                    break;
                default:
                    break;
            }
        }
    };
    

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{artifactToEdit ? 'Editar Artefacto Quemado' : 'Agregar Artefacto Quemado'}</h3>
                <div className={styles.field}>
                    <label>Artefacto</label>
                    <input
                        type="text"
                        id='artifactName'
                        name='artifactName'
                        value={artifactName}
                        className={styles.input}
                        onChange={(e) => setArtifactName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={250}
                    />
                </div>
                <div className={styles.field}>
                    <label>Marca</label>
                    <input
                        type="text"
                        id='artifactBrand'
                        name='artifactBrand'
                        value={artifactBrand}
                        className={styles.input}
                        onChange={(e) => setArtifactBrand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={250}
                    />
                </div>
                <div className={styles.field}>
                    <label>Modelo</label>
                    <input
                        type="text"
                        id='artifactModel'
                        name='artifactModel'
                        value={artifactModel}
                        className={styles.input}
                        onChange={(e) => setArtifactModel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={250}
                    />
                </div>
                <div className={styles.field}>
                    <label>Número de Serie</label>
                    <input
                        type="text"
                        id='artifactSerialNumber'
                        name='artifactSerialNumber'
                        value={artifactSerialNumber}
                        className={styles.input}
                        onChange={(e) => setArtifactSerialNumber(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={250}
                    />
                </div>
                <div className={styles.field}>
                    <label>Documentación Adicional</label>
                    <input
                        type="text"
                        id='artifactDocumentation'
                        name='artifactDocumentation'
                        value={artifactDocumentation}
                        className={styles.input}
                        onChange={(e) => setArtifactDocumentation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={250}
                    />
                </div>
                <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                <button className={styles.saveButton} onClick={handleSave}>Guardar</button>
                    
                </div>
            </div>
        </div>
    );
};

export default ArtifactModal;
