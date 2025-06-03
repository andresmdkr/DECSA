import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import Swal from 'sweetalert2';
import { createInternalWorkOrder, updateInternalWorkOrder } from '../../redux/slices/otiSlice.js';
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice.js';
import { AiOutlineClose } from 'react-icons/ai';
import OtiPDF from '../OtiPDF/OtiPDF.js';
import styles from './OtiForm.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const OtiForm = ({ mode: initialMode, onClose, data }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);



  const [dataId, setDataId] = useState(data?.id || null);
  const [mode, setMode] = useState(initialMode);
  const [otiData, setOtiData] = useState({
    task: '',
    date: new Date().toISOString().split('T')[0], 
    location: '',
    observations: '',
    assignedTo: '',
    status: 'Open',
    completionDate: '',
    files: [],
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

   const technicalServices = useSelector((state) => state.technicalService.technicalServices);


  useEffect(() => {
  dispatch(fetchAllTechnicalServices());
}, [dispatch]);

const filteredOperationalAgents = technicalServices.filter(
  (service) => service.area === 'operaciones'
);

const sortedOperationalAgents = [...filteredOperationalAgents].sort((a, b) =>
  a.name.localeCompare(b.name)
);

const groupedByType = {
  'personal propio': [],
  contratista: [],
  redes: [],
};

sortedOperationalAgents.forEach((agent) => {
  if (groupedByType[agent.type]) {
    groupedByType[agent.type].push(agent);
  }
});

  useEffect(() => {
    if (initialMode !== 'create' && data) {
      setDataId(data.id);
      setOtiData({
        task: data.task || '',
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
        location: data.location || '',
        observations: data.observations || '',
        assignedTo: data.assignedTo || '',
        status: data.status || 'Open',
        completionDate: data.completionDate ? data.completionDate.split('T')[0] : '',
        files: data.files || [],
      });

      const existingFiles = data.files ? data.files.map((file) => ({
        name: file.split('\\').pop(),
        isNew: false,
        url: `/uploads/OTI/OTI-${data.id}/${file.split('\\').pop()}`,
      })) : [];
      setSelectedFiles(existingFiles);
    }
  }, [initialMode, data]);

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
    if (mode === 'view') return;
  
    const updatedOtiData = {
      ...otiData,
      date: new Date(otiData.date + "T00:00:00-03:00").toISOString(),
      completionDate: otiData.completionDate ? new Date(otiData.completionDate + "T00:00:00-03:00").toISOString() : null,
      files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
    };
  
    Object.keys(updatedOtiData).forEach(key => {
      if (updatedOtiData[key] === '') {
        updatedOtiData[key] = " "; 
      }
    }); 

    try {
      let response;
      if (mode === 'create') {
        response = await dispatch(createInternalWorkOrder({ internalWorkOrderData: updatedOtiData })).unwrap();
      } else if (mode === 'edit' && data) {
        response = await dispatch(updateInternalWorkOrder({
          internalWorkOrderId: data.id,
          internalWorkOrderData: updatedOtiData,
          sacId: data.sacId,
          isDerived: data.isDerived || false,
        })).unwrap();
      }
  
      setOtiData({ ...updatedOtiData, ...response });
  
      // Cerrar el modal antes de mostrar la alerta
      setDataId(response?.id || null);
      onClose(response);
  
      await Swal.fire({
        title: `Orden de Trabajo Interna #${response?.id || 'S/N'} guardada correctamente`,
        text: `Corresponde a la SAC #${response?.sacId || 'S/N'}`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Imprimir O.T.I',
        cancelButtonText: 'Cerrar',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          OtiPDF(updatedOtiData, response?.id, response?.sacId);
        }
      });
    } catch (error) {
      console.error('Error guardando la OTI:', error);
    }
  };

  const handlePrint = async () => {
    const updatedOtiData = {
      ...otiData,
      date: new Date(otiData.date + "T00:00:00-03:00").toISOString(),
      completionDate: otiData.completionDate ? new Date(otiData.completionDate + "T00:00:00-03:00").toISOString() : null
    };

    Object.keys(updatedOtiData).forEach(key => {
      if (updatedOtiData[key] === '') {
        updatedOtiData[key] = " "; 
      }
    }); 
  
    try {
      await dispatch(updateInternalWorkOrder({
        internalWorkOrderId: data.id,
        internalWorkOrderData: updatedOtiData,
        sacId: data.sacId,
        isDerived: data.isDerived || false,
      }));
  
      await new Promise((resolve) => {
        OtiPDF(updatedOtiData, dataId, data.sacId);
        setTimeout(resolve, 100); 
      });
  
      onClose();
    } catch (error) {
      console.error("Error al imprimir la OTI:", error);
    }
  };
  
const handleChange = (e) => {
  const { name, value } = e.target;

  setOtiData((prevState) => {
    const updatedState = { ...prevState, [name]: value };
    if (name === 'assignedTo' && value !== prevState.assignedTo) {
      updatedState.status = 'Open';
    }

    return updatedState;
  });
};




  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'view') {
      setOtiData(prevState => ({ ...prevState, status: 'Closed' }));
    }
    if (newMode === 'edit') {
      setOtiData(prevState => ({ ...prevState, status: 'Open' }));
    }
  };

  const handleCloseOti = async () => {
    if (mode === 'create'){ 
      return onClose(otiData)};
  
    try {
      await dispatch(updateInternalWorkOrder({
        internalWorkOrderId: data.id,
        internalWorkOrderData: otiData,
        sacId: data.sacId,
        isDerived: data.isDerived || false,
      }));
      onClose(otiData);
    } catch (error) {
      console.error('Error al cerrar la OTI:', error);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className={styles.overlay}>
    <div className={styles.modal}>
      <button className={styles.closeButton} onClick={() => handleCloseOti()}>
        <AiOutlineClose size={20} />
      </button>
      <h2 className={styles.title}>
        {mode === 'create' ? 'Crear O.T.I' : mode === 'edit' ? 'Editar O.T.I' : 'Ver O.T.I'}
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formOverlay}>
      <label className={styles.label}>
        Tarea:
        <input type="text" name="task" className={styles.input} value={otiData.task} onChange={handleChange} readOnly={mode === 'view'} required maxLength={255} />
      </label>
      <label className={styles.label}>
        Lugar:
        <input type="text" name="location" className={styles.input} value={otiData.location} onChange={handleChange} readOnly={mode === 'view'} maxLength={255} />
      </label>
      <label className={styles.label}>
        Fecha:
        <input type="date" name="date" className={styles.input} value={otiData.date} onChange={handleChange} readOnly={mode === 'view'} required />
      </label>
      <label className={styles.label}>
        Observaciones:
        <input type="text" name="observations" className={styles.input} value={otiData.observations} onChange={handleChange} readOnly={mode === 'view'} maxLength={1000} />
      </label>
<div className={styles.inlineGroup}>
  <label className={styles.label}>Responsable:</label>
  <select
    name="assignedTo"
    className={`${styles.select} ${mode === 'view' ? styles.disabledSelect : ''}`}
    value={otiData.assignedTo}
    onChange={handleChange}
    disabled={mode === 'view'}
  >
    <option value="">Seleccionar...</option>

    <optgroup label="Personal Propio">
      {groupedByType['personal propio'].map((agent) => (
        <option key={agent.id} value={agent.name}>
          {agent.name}
        </option>
      ))}
    </optgroup>

    <optgroup label="Contratista">
      {groupedByType['contratista'].map((agent) => (
        <option key={agent.id} value={agent.name}>
          {agent.name}
        </option>
      ))}
    </optgroup>

    <optgroup label="Redes">
      {groupedByType['redes'].map((agent) => (
        <option key={agent.id} value={agent.name}>
          {agent.name}
        </option>
      ))}
    </optgroup>
  </select>
</div>


      {mode !== 'create' && (
        <label className={styles.label}>
        Realizado:
        <input type="date" name="completionDate" className={styles.input} value={otiData.completionDate} onChange={handleChange} readOnly={mode === 'view'} />
      </label>
      )}
        
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
                    </div>
                    <div className={styles.buttonContainer}>
          {mode === 'edit' && (
            <>
            
            <button type="button" className={styles.printButton} onClick={handlePrint}>
              Imprimir O.T.I
            </button>
            <button type="button" className={styles.statusButton} onClick={() => handleModeChange('view')}>
              Finalizar O.T.I
            </button>
            </>
          )}
          {mode === 'view' && (
            <>
              <button type="button" className={styles.close2Button} onClick={() => handleCloseOti()}>
                Cerrar O.T.I
              </button>
              <button type="button" className={styles.status2Button} onClick={() => handleModeChange('edit')}>
                Reabrir O.T.I
              </button>
            </>
          )}
          {mode === 'edit ' && (
            <button type="button" className={styles.printButton} onClick={handlePrint}>
              Imprimir O.T.I
            </button>
          )}
          {mode !== 'view' && (
            <button type="submit" className={styles.submitButton}>
              {mode === 'create' ? 'Crear O.T.I' : 'Guardar Cambios'}
            </button>
          )}
        </div>
      </form>
      
    </div>
  </div>

  );
};

export default OtiForm;