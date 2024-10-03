import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './OtForm.module.css';
import { createWorkOrder, updateWorkOrder } from '../../redux/slices/otSlice';
import { useDispatch } from 'react-redux';
import OtPDF from '../OtPDF/OtPDF';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const OtForm = ({ sac, onClose, ot, mode }) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState('In Progress');
  const [reason, setReason] = useState('Personalizado');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const previousStatus = useRef(status);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      if (ot) {
        setStatus(ot.status);
        setReason(ot.reason);
        setDescription(ot.description);

        const existingFiles = ot.files
          ? ot.files.map((file) => ({
              name: file.split('\\').pop(),
              isNew: false,
              url: `/uploads/OT/OT-${ot.id}/${file.split('\\').pop()}`,
            }))
          : [];
        setSelectedFiles(existingFiles);
      }
    }
  }, [mode, ot]);

  const renameFileIfDuplicate = (file, existingFiles) => {
    let newFileName = file.name;
    let fileCount = 1;
    while (existingFiles.some((f) => f.name === newFileName)) {
      const fileExtension = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExtension}`, '');
      newFileName = `${baseName}(${fileCount}).${fileExtension}`;
      fileCount++;
    }
    return new File([file], newFileName, { type: file.type });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const tooLargeFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (tooLargeFiles.length > 0) {
      setErrorMessage('Uno o más archivos superan el tamaño máximo de 50 MB.');
    } else {
      const renamedFiles = files.map((file) => renameFileIfDuplicate(file, selectedFiles));
      setSelectedFiles([...selectedFiles, ...renamedFiles.map((file) => ({ file, name: file.name, isNew: true }))]);
      setErrorMessage('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileName) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === 'Completed') {
      Swal.fire({
        title: '¿Estás seguro de cerrar esta Orden de Trabajo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'No',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await processWorkOrder();
        } else {
          setStatus(previousStatus.current);
        }
      });
    } else {
      await processWorkOrder();
    }
  };

  const processWorkOrder = async () => {
    const workOrderData = {
      status,
      reason,
      description,
      files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
    };

    try {
      if (mode === 'edit') {
        await dispatch(updateWorkOrder({ workOrderId: ot.id, workOrderData }));
        Swal.fire({
          title: `Orden de Trabajo #${ot.id} actualizada con éxito`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        const response = await dispatch(createWorkOrder({ sacId: sac.id, workOrderData }));
        Swal.fire({
          title: 'Orden de Trabajo creada con éxito',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Imprimir',
          cancelButtonText: 'Cerrar',
        }).then((result) => {
          if (result.isConfirmed) {
            OtPDF(sac.id)
          } else {
            onClose();
          }
        });
      }
      onClose();
    } catch (error) {
      console.error('Error al procesar la Orden de Trabajo:', error);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
  };

    const handlePrint = () => {
    OtPDF(sac.id);
    };

  const isReadOnly = mode === 'view';

  return (
    <div className={styles.otModalOverlay}>
      <div className={styles.otModalContent}>
        <button className={styles.otCloseButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.otTitle}>
          {mode === 'edit' ? `Orden de Trabajo #${ot.id}` : mode === 'view' ? `Orden de Trabajo #${ot.id} (Cerrada)` : 'Nueva Orden de Trabajo'}
        </h2>

        <div className={styles.otFormContainer}>
          <form onSubmit={handleSubmit}>
            {mode !== 'create' && (
              <div className={styles.inlineGroup}>
                <label className={styles.otLabel}>Estado:</label>
                <select
                  className={styles.otSelect}
                  value={status}
                  onChange={handleStatusChange}
                  disabled={isReadOnly}
                >
                  <option value="In Progress">En Curso</option>
                  <option value="Completed">Cerrado</option>
                </select>
              </div>
            )}

            <div className={styles.inlineGroup}>
              <label className={styles.otLabel}>Motivo:</label>
              <select
                className={styles.otSelect}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isReadOnly}
              >
                <option value="Personalizado">Personalizado</option>
                <option value="Artefacto Quemado">Artefacto Quemado</option>
              </select>
            </div>

            <div className={styles.textareaGroup}>
              <label className={styles.otLabel}>Orden de Trabajo:</label>
              <textarea
                className={styles.otTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Redactar Orden de Trabajo..."
                maxLength={1000}
                readOnly={isReadOnly}
              />
            </div>

            <hr className={styles.separator} />

            {mode !== 'create' && selectedFiles.length > 0 && (
              <div className={styles.otFileList}>
                <h3>Archivos:</h3>
                <ul>
                  {selectedFiles.map((file) => (
                    <li key={file.name}>
                      {file.isNew ? (
                        <>
                          {file.name}
                          <button
                            type="button"
                            className={styles.otFileRemoveButton}
                            onClick={() => handleFileRemove(file.name)}
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.otFileLinkButton}
                          onClick={() => window.open(`${API_BASE_URL}${file.url}`, '_blank')}
                        >
                          {file.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isReadOnly && mode !== 'create' && (
              <label className={styles.otLabel}>
                Subir archivos (máximo 50 MB por archivo):
                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.otFileInput}
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            )}

            {errorMessage && <p className={styles.otErrorMessage}>{errorMessage}</p>}

            {!isReadOnly && (
              <div className={`${styles.otButtonContainer} ${(mode === 'edit' ? 1 : 0) + 1 === 1 ? styles.singleButton : ''}`}>
                {mode !== 'create' && (
                  <button className={styles.otSubmitButton} type="button" onClick={handlePrint}>
                    Imprimir O.T
                  </button>
                )}
                <button className={styles.otSubmitButton} type="submit">
                  {mode === 'create' ? 'Crear O.T' : 'Grabar'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtForm;
