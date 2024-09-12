import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './OacForm.module.css';
import { createOac } from '../../redux/slices/oacSlice';
import { useDispatch } from 'react-redux';

const OacForm = ({ sac,onClose }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('Pending'); // Estado inicial "Pending"
  const [issueDate, setIssueDate] = useState('');
  const [resolution, setResolution] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 10 MB

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convertimos a array para poder manipular
    const tooLargeFiles = files.filter(file => file.size > MAX_FILE_SIZE);

    if (tooLargeFiles.length > 0) {
      setErrorMessage(`Uno o más archivos superan el tamaño máximo de 50 MB.`);
    } else {
      setSelectedFiles([...selectedFiles, ...files]); // Añadir nuevos archivos sin borrar los anteriores
      setErrorMessage(''); // Limpiamos el mensaje de error si todo está bien
    }
  };

  const handleFileRemove = (fileName) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== fileName)); // Removemos el archivo por nombre
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Crear FormData para manejar archivos y otros campos
    const formData = new FormData();
    formData.append('status', status);
    formData.append('issueDate', issueDate);
    formData.append('resolution', resolution);
    formData.append('resolutionDate', resolutionDate);
    formData.append('assignedTechnician', assignedTechnician);
  
    // Añadir archivos al FormData
    selectedFiles.forEach((file) => {
      formData.append('files', file); // Enviar archivos reales, no solo los nombres
    });
  
    try {
      // Llamada al dispatch con la estructura correcta
      await dispatch(createOac({ sacId: sac.id, oacData: formData }));
      console.log('OAC creada con éxito');
      onClose(); // Cerrar el modal si todo fue exitoso
    } catch (error) {
      console.error('Error al crear la OAC:', error);
    }
  };
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.title}>O.A.C</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Estado:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pendiente</option>
              <option value="In Progress">En Curso</option>
              <option value="Completed">Cerrado</option>
            </select>
          </label>

          <label>
            Fecha de emisión:
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </label>

          <label>
            Resolución:
            <input
              type="text"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Descripción de la resolución"
            />
          </label>

          <label>
            Fecha de resolución:
            <input
              type="date"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
            />
          </label>

          <label>
            Técnico asignado:
            <input
              type="text"
              value={assignedTechnician}
              onChange={(e) => setAssignedTechnician(e.target.value)}
              placeholder="Nombre del técnico asignado"
            />
          </label>

          <label>
            Subir archivos (máximo 10 MB por archivo):
            <input
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </label>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

          {/* Mostrar archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className={styles.fileList}>
              <h3>Archivos seleccionados:</h3>
              <ul>
                {selectedFiles.map((file) => (
                  <li key={file.name}>
                    {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                    <button
                      className={styles.removeButton}
                      onClick={() => handleFileRemove(file.name)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.buttonsContainer}>
            <button className={styles.actionButton} type="submit">
              Generar O.A.C
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OacForm;
