import React, { useState, useEffect, useRef } from 'react';
import styles from './OacForm.module.css';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { createOac, updateOac, fetchOACs } from '../../redux/slices/oacSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { updateSAC } from '../../redux/slices/sacsSlice';
import OacXLSX from '../OacXLSX/OacXLSX';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const OacForm = ({ sac, oac, onClose, onOacCreated, mode }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [oacNumber, setOacNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [formMode, setFormMode] = useState(mode);

useEffect(() => {
  setFormMode(mode);
}, [mode]);


  useEffect(() => {
    if (sac.clientId) {
      dispatch(fetchClientByAccountNumber(sac.clientId))
        .unwrap()
        .then(setClient)
        .catch((error) => console.error('Error fetching client:', error));
    }

    if (mode !== 'create' && oac) {
      setOacNumber(String(oac.id));
      const mainFileExist = oac.mainFile
        ? [{ name: oac.mainFile.split('\\').pop(), isNew: false, url: `/uploads/OAC/OAC-${oac.id}/${oac.mainFile.split('\\').pop()}` }]
        : [];

      setMainFile(mainFileExist);

      const existingFiles = oac.files
        ? oac.files.map((file) => ({
            name: file.split('\\').pop(),
            isNew: false,
            url: `uploads/OAC/OAC-${oac.id}/${file.split('\\').pop()}`,
          }))
        : [];
      setSelectedFiles(existingFiles);
    }
  }, [dispatch, sac.clientId, mode, oac]);

  const handleOacNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 20) {
      setOacNumber(value);
    }
  };

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
      setErrorMessage(`Uno o más archivos superan el tamaño máximo de 50 MB.`);
    } else {
      const renamedFiles = files.map((file) => renameFileIfDuplicate(file, selectedFiles));
      setSelectedFiles([
        ...selectedFiles,
        ...renamedFiles.map((file) => ({ file, name: file.name, isNew: true })),
      ]);
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
    try {
      setIsLoading(true);
  
      if (mode === 'create') {
        const confirm = await Swal.fire({
          title: `¿Está seguro de que desea crear la OAC con el número ${oacNumber}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, crear',
          cancelButtonText: 'Cancelar',
        });
  
        if (!confirm.isConfirmed) return;
  
        const blob = await OacXLSX({ oacNumber, sac, client });
        
  
        const oacData = {
          id: oacNumber,
          description: `OAC #${oacNumber} creada correctamente`,
          mainFile: blob,
          files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
        };
        const response = await dispatch(createOac({ sacId: sac.id, oacData })).unwrap();

        downloadFile(blob, `OAC_${oacNumber}.xlsx`);

        if (sac.status !== 'Open') {
          await dispatch(updateSAC({ id: sac.id, sacData: { status: 'Open' } })).unwrap();
        }
        
  
        Swal.fire({
          icon: 'success',
          title: `OAC creada con éxito (ID: ${response.id})`,
        });
  
        if (onOacCreated) {
          onOacCreated(sac.id);
        }
      } else if (mode === 'edit') {
        const oacData = {
          id: oacNumber,
          mainFile: mainFile?.[0]?.file || undefined,
          files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
        };
        await dispatch(updateOac({ oacId: oac.id, sacId: sac.id, oacData }));
        Swal.fire({ icon: 'success', title: 'OAC actualizada con éxito' });
      }
  
      onClose();
    } catch (error) {
      if (error.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'OAC duplicada',
          text: error.data?.message || 'Ya existe una OAC con este número.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Hubo un error al procesar la OAC.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  

  const downloadFile = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url); 
  };




  const handleMainFileUpdate = (e) => {
    const file = e.target.files[0];
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
    ];

    if (file) {
        setUploadedFileName(file.name);
        if (!allowedMimeTypes.includes(file.type)) {
            setErrorMessage('El archivo debe ser de tipo Excel (.xlsx o .xls).');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setErrorMessage('El archivo supera el tamaño máximo de 50 MB.');
            return;
        }

        const originalFileName = mainFile?.[0]?.name || file.name;
        const renamedFile = new File([file], originalFileName, { type: file.type });

        setMainFile([{ file: renamedFile, name: originalFileName, isNew: true }]);
        setErrorMessage('');
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
};

const handleFinalize = async () => {
  try {
    setIsLoading(true);

    if (formMode === 'view') {
      const confirm = await Swal.fire({
        title: `¿Está seguro de que desea reabrir esta OAC?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, reabrir',
        cancelButtonText: 'Cancelar',
      });

      if (!confirm.isConfirmed) return;

      await dispatch(updateOac({ oacId: oac.id, oacData: { status: 'Open' } }));
      setFormMode('edit');
      return;
    }

    const confirm = await Swal.fire({
      title: `¿Está seguro de que desea finalizar esta OAC?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    // Guarda los cambios realizados antes de finalizar
    const oacData = {
      id: oacNumber,
      mainFile: mainFile?.[0]?.file || undefined,
      files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
      status: 'Completed', // Cambia el estado a "Completed"
    };

    await dispatch(updateOac({ oacId: oac.id, sacId: sac.id, oacData }));
    Swal.fire({ icon: 'success', title: 'OAC finalizada con éxito' });
    onClose();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al finalizar',
      text: error.message || 'Hubo un error al finalizar la OAC.',
    });
  } finally {
    setIsLoading(false);
  }
};

  

  return (
    <div className={styles.oacModalOverlay}>
      <div className={styles.oacModalContent}>
        <button className={styles.oacCloseButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.oacTitle}>{formMode === 'create' ? 'Crear Nueva O.A.C' : `Editar O.A.C #${oac.id}`}</h2>
        <div className={styles.oacFormContainer}>
          <div className={styles.inlineGroup}>
            <label className={styles.oacLabel}>Número de O.A.C:</label>
            <input
              type="text"
              className={styles.oacInput}
              value={oacNumber}
              onChange={handleOacNumberChange}
              placeholder="Ingrese el número de la O.A.C"
              readOnly={formMode === 'edit'}
            />
          </div>
          {mainFile && (
              <>
                <hr className={styles.separator} />
                <div className={styles.mainFile}>
                  <div className={styles.mainFileText}>
                    <span>ARCHIVO EXCEL:</span>
                    <a
                      href={`${API_BASE_URL}${mainFile[0].url || ''}`}
                      download
                      className={styles.mainFileLink}
                    >
                      {mainFile[0].name}
                    </a>
                  </div>
                  <div className={styles.fileActions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => window.open(`${API_BASE_URL}${mainFile[0].url || ''}`, '_blank')}
                    >
                      Descargar archivo
                    </button>
                    <input
                      type="file"
                      className={styles.hiddenInput}
                      id="uploadFile"
                      onChange={(e) => handleMainFileUpdate(e)}
                      disabled={formMode === 'create'}
                      accept=".xlsx,.xls"
                    />
                    
                    <label htmlFor="uploadFile" className={styles.actionButton}>
                      Subir archivo modificado
                    </label>

                  </div>
                  {uploadedFileName && (
                    <div className={styles.uploadedFileName}>
                      Archivo seleccionado: <strong>{uploadedFileName}</strong>
                    </div>
                  )}
                </div>
                <hr className={styles.separator} />
              </>
            )}
          {selectedFiles.length > 0 && (
            <div className={styles.oacFileList}>
              <h3> Otros Archivos:</h3>
              <ul>
                {selectedFiles.map((file) => (
                  <li key={file.name}>
                    {file.isNew ? (
                      <>
                        {file.name}
                        <button
                          type="button"
                          className={styles.oacFileRemoveButton}
                          onClick={() => handleFileRemove(file.name)}
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.oacFileLinkButton}
                          onClick={() => window.open(`${API_BASE_URL}/${file.url}`, '_blank')}
                        >
                          {file.name}
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {formMode === 'edit' && (
            <div className={styles.oacFileList1}>
              <label className={styles.oacLabel1}>
                Subir otros archivos (máximo 50 MB por archivo):
                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.oacFileInput}
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
            )}
          {errorMessage && <p className={styles.oacErrorMessage}>{errorMessage}</p>}
        </div>
        <div
            className={`${styles.oacButtonContainer} ${
              formMode !== 'create' ? styles.spaceBetween : styles.flexEnd
            }`}
          >
            {formMode !== 'create' && (
              <button
                  className={styles.oacFinalizeButton}
                  onClick={handleFinalize}
                  disabled={isLoading}
                >
                  {isLoading
                    ? formMode === 'view' ? 'Reabriendo...' : 'Finalizando...'
                    : formMode === 'view' ? 'Reabrir O.A.C' : 'Finalizar O.A.C'}
                </button>
            )}
            <button
              className={styles.oacSubmitButton}
              onClick={handleSubmit}
              disabled={!oacNumber.trim() || isLoading}
            >
              {isLoading ? 'Procesando...' : formMode === 'create' ? 'Crear Nueva O.A.C' : 'Guardar Cambios'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default OacForm;





/*   import React, { useState, useEffect, useRef } from 'react';
  import { AiOutlineClose } from 'react-icons/ai';
  import styles from './OacForm.module.css';
  import { createOac, updateOac } from '../../redux/slices/oacSlice';
  import { useDispatch,useSelector } from 'react-redux';
  import OacPDF from '../OacPDF/OacPDF';
  import Swal from 'sweetalert2';
  import tensionOptions from './tensionOptions.json'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const OacForm = ({ sac, onClose, oac, mode: initialMode, onOacCreated }) => { */
  /*   const eventDate = sac.eventDate ? new Date(sac.eventDate).toISOString().split('T')[0] : '';   */

/*     const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const [currentMode, setCurrentMode] = useState(initialMode);
    
    const [status, setStatus] = useState('In Progress');
    const [issueDate, setIssueDate] = useState(localDate.toISOString().split('T')[0]); 
    const [issueTime, setIssueTime] = useState(now.toTimeString().split(' ')[0].slice(0, 5)); 
    const [tension, setTension] = useState('');
    const [failureReason, setFailureReason] = useState('');
    const [performedWork, setPerformedWork] = useState('');
    const [pendingTasks, setPendingTasks] = useState('');
    const [assignedPerson, setAssignedPerson] = useState('');
    const [assignmentTime, setAssignmentTime] = useState('');
    const [oacReason, setOacReason] = useState(`${sac.claimReason}: ${sac.description}`);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const failureReasons = tension ? tensionOptions[tension]?.failureReasons || [] : [];
    const performedWorks = tension ? tensionOptions[tension]?.performedWorks || [] : [];
 

    const fileInputRef = useRef(null); 

    useEffect(() => {
      if (currentMode === 'edit' || currentMode === 'view') {
        if (oac) {
          setIssueDate(oac.issueDate);
          setIssueTime(oac.issueTime);
          setTension(oac.tension);
          setFailureReason(oac.failureReason);
          setPerformedWork(oac.performedWork);
          setPendingTasks(oac.pendingTasks);
          setAssignedPerson(oac.assignedPerson);
          setAssignmentTime(oac.assignmentTime);
          setOacReason(oac.oacReason);
 
          const existingFiles = oac.files
            ? oac.files.map((file) => ({ name: file.split('\\').pop(), isNew: false, url: `/uploads/OAC/OAC-${oac.id}/${file.split('\\').pop()}` }))
            : [];
          setSelectedFiles(existingFiles);
        }
      }
    }, [currentMode, oac]); */

/*     useEffect(() => {
      if (currentMode === 'edit' || currentMode === 'view') {
        if (oac) {
          setStatus(oac.status);
          setIssueDate(oac.issueDate);
          setIssueTime(oac.issueTime);
          setTension(oac.tension);
          setFailureReason(oac.failureReason);
          setPerformedWork(oac.performedWork);
          setPendingTasks(oac.pendingTasks);
          setAssignedPerson(oac.assignedPerson);
          setAssignmentTime(oac.assignmentTime);
          setOacReason(oac.oacReason);
    
          // Actualizamos el manejo de archivos para sistemas Unix/Linux
          const existingFiles = oac.files
            ? oac.files.map((file) => {
                const fileName = file.split('/').pop(); // Ajustado para Unix/Linux
                return {
                  name: fileName,
                  isNew: false,
                  url: `/uploads/OAC/OAC-${oac.id}/${fileName}`, // Genera la URL correctamente
                };
              })
            : [];
            
          setSelectedFiles(existingFiles);
        }
      }
    }, [currentMode, oac]); */
    


/*     useEffect(() => {
      setCurrentMode(initialMode); 
    }, [initialMode]);
 
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
      const tooLargeFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
      if (tooLargeFiles.length > 0) {
        setErrorMessage(`Uno o más archivos superan el tamaño máximo de 50 MB.`);
      } else {
        const renamedFiles = files.map(file => renameFileIfDuplicate(file, selectedFiles));
        setSelectedFiles([...selectedFiles, ...renamedFiles.map(file => ({ file, name: file.name, isNew: true }))]);
        setErrorMessage('');
      }
    
 
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleFileRemove = (fileName) => {
      setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
    };


    const handleSuccessAlert = (oacId) => {
      Swal.fire({
        title: `OAC creada con éxito con ID: ${oacId}`,
        showCancelButton: true,
        confirmButtonText: 'Imprimir',
        cancelButtonText: 'Cerrar',
        icon: 'success',
      }).then((result) => {
        if (result.isConfirmed) {
          
          OacPDF(sac.id, oacId);
        }
        onClose(); 
      });
    };

    const handleEditAlert = async (sacId, oacId, oacData) => {
      console.log(sacId, oacId, oacData);
      if (oacData.status === 'Completed' || status === 'Completed') {
        Swal.fire({
          title: `¿Está seguro de cerrar la OAC #${oacId}?`,
          text: "Esta acción no se puede deshacer.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cerrar OAC',
          cancelButtonText: 'Cancelar',
        }).then(async (result) => {
          if (result.isConfirmed) {
            await dispatch(updateOac({ sacId, oacId, oacData }));
            Swal.fire('Cerrada', `La OAC #${oacId} ha sido cerrada.`, 'success');
            onClose();
          }
        });
      } else {
        await dispatch(updateOac({ sacId, oacId, oacData }));
        Swal.fire({
          title: `OAC #${oacId} editada con éxito`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    };
    
    
    
    const handleEdit = async () => {
      const oacData = {
        status: 'Completed',
        issueDate,
        issueTime,
        assignedPerson,
        assignedBy: `${user?.name} ${user?.lastName}`,
        assignmentTime,
        oacReason,
        tension,
        failureReason,
        performedWork,
        pendingTasks,
        files: selectedFiles.map(f => f.isNew ? f.file : f.name), 
      };
      console.log(status)
      handleEditAlert(sac.id,oac.id, oacData);          
      
    };
          

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(status)

      const oacData = {
        status,
        issueDate,
        issueTime,
        assignedPerson,
        assignedBy: `${user?.name} ${user?.lastName}`,
        assignmentTime,
        oacReason,
        tension,
        failureReason,
        performedWork,
        pendingTasks,
        files: selectedFiles.map(f => f.isNew ? f.file : f.name), 
      };

      try {
        if (currentMode === 'edit') {
          if (status === 'Completed') {
            const sacId = sac.id;
            const oacId = oac.id;
            const oacDataWithUpdatedStatus = { ...oacData, status: "In Progress" };
            await dispatch(updateOac({ sacId, oacId, oacData: oacDataWithUpdatedStatus }));
            handleEditAlert(sacId,oacId, oacData);
          }
          handleEditAlert(sac.id,oac.id, oacData);          
        } else {
          const response = await dispatch(createOac({ sacId: sac.id, oacData }));
          const newOacId = response.payload.id; 
          console.log('OAC creada con éxito con ID:', newOacId);
          if (onOacCreated) {
            onOacCreated(sac.id);
        }
          handleSuccessAlert(newOacId); 
        }
        onClose();
      } catch (error) {
        console.error('Error al procesar la OAC:', error);
      }
    };

    const isReadOnly = currentMode === 'view';

    const handleSwitchToEdit = () => {
      setCurrentMode('edit'); 
      setStatus('In Progress');
    };

    return (
      <div className={styles.oacModalOverlay}>
        <div className={styles.oacModalContent}>
          <button className={styles.oacCloseButton} onClick={onClose}>
            <AiOutlineClose />
          </button>
          <h2 className={styles.oacTitle}>
            {currentMode === 'edit' ? `O.A.C #${oac.id}` : currentMode === 'view' ? `O.A.C #${oac.id} (Cerrada)` : 'Nueva O.A.C'}
          </h2>
    
          <div className={styles.oacFormContainer}>
            <form onSubmit={handleSubmit}>
    
              <div className={styles.inlineGroup}>
                <label className={styles.oacLabel}>Fecha de emisión:</label>
                <input
                  type="date"
                  className={`${styles.oacInput} ${styles.longInput}`}
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  readOnly={isReadOnly}
                />
                <label className={styles.oacLabel}>Hora de emisión:</label>
                <input
                  type="time"
                  className={`${styles.oacInput} ${styles.shortInput}`}
                  value={issueTime}
                  onChange={(e) => setIssueTime(e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
    
              <div className={styles.inlineGroup}>
                <label className={styles.oacLabel}>Persona asignada:</label>
                <input
                  type="text"
                  className={`${styles.oacInput} ${styles.longInput}`}
                  value={assignedPerson}
                  onChange={(e) => setAssignedPerson(e.target.value)}
                  placeholder="Nombre de la persona asignada"
                  readOnly={isReadOnly}
                  maxLength={250}
                />
                <label className={styles.oacLabel}>Hora de asignación:</label>
                <input
                  type="time"
                  className={`${styles.oacInput} ${styles.shortInput}`}
                  value={assignmentTime}
                  onChange={(e) => setAssignmentTime(e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              <div className={styles.inlineGroup}>
                <label className={styles.oacLabel}>Motivo O.A.C:</label>
                <input
                  type="text"
                  className={`${styles.oacInput}`}
                  value={oacReason}
                  onChange={(e) => setOacReason(e.target.value)}
                  placeholder="Motivo de la O.A.C"
                  readOnly={isReadOnly}
                  maxLength={250}
                />
              </div>


              <hr className={styles.separator} />
    
              {currentMode !== 'create' && (
                <>

                    <div className={styles.inlineGroup}>
                      <label className={styles.oacLabel}>Tipo de Falla:</label>
                      <select
                        value={tension}
                        onChange={(e) => setTension(e.target.value)}
                        className={styles.oacSelect}
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccione</option>
                        <option value="BT">Baja Tensión (B.T.)</option>
                        <option value="MT">Media Tensión (M.T.)</option>
                      </select>
                    </div>

                    <hr className={styles.separator} />
                  {tension && (
                    <>
                    <div className={styles.inlineGroup}>
                      <label className={styles.oacLabel}>Motivo de la falla:</label>
                      <select
                        value={failureReason}
                        onChange={(e) => setFailureReason(e.target.value)}
                        className={styles.oacSelect}
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccione</option>
                        {failureReasons.map((reason) => (
                          <option key={reason.code} value={reason.code}>
                           {reason.code} / {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
          
                    <div className={styles.inlineGroup}>
                      <label className={styles.oacLabel}>Trabajos realizados:</label>
                      <select
                        value={performedWork}
                        onChange={(e) => setPerformedWork(e.target.value)}
                        className={styles.oacSelect}
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccione</option>
                        {performedWorks.map((work) => (
                          <option key={work.code} value={work.code}>
                            {work.code} / {work.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.textareaGroup}>
                        <label className={styles.oacLabel}>Tareas pendientes:</label>
                        <textarea
                          className={styles.oacTextarea} 
                          value={pendingTasks}
                          onChange={(e) => setPendingTasks(e.target.value)}
                          placeholder="Tareas pendientes"
                          maxLength={1000}
                          readOnly={isReadOnly}
                        />
                      </div>
                      <hr className={styles.separator} />

                  </>
                  )}
                  
                  {selectedFiles.length > 0 && (
                    <div className={styles.oacFileList}>
                      <h3>Archivos:</h3>
                      <ul>
                        {selectedFiles.map((file) => (
                          <li key={file.name}>
                            {file.isNew ? (
                              <>
                                {file.name}
                                <button
                                  type="button"
                                  className={styles.oacFileRemoveButton}
                                  onClick={() => handleFileRemove(file.name)}
                                >
                                  Eliminar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className={styles.oacFileLinkButton}
                                  onClick={() => window.open(`${API_BASE_URL}${file.url}`, '_blank')}
                                >
                                  {file.name}
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
    
                  {!isReadOnly && (
                    <div className={styles.oacFileList1}>
                    <label className={styles.oacLabel1}>
                      Subir archivos (máximo 50 MB por archivo):
                      <input
                        ref={fileInputRef}
                        type="file"
                        className={styles.oacFileInput}
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    </div>
                  )}
                  {errorMessage && <p className={styles.oacErrorMessage}>{errorMessage}</p>}
                </>
              )}
            </form>
          </div>

          {currentMode === 'view' && (
            <div className={`${styles.oacButtonContainer} ${(currentMode === 'edit' ? 1 : 0) + 1 === 1 ? styles.singleButton : ''}`}>
              <button
                type="button"
                className={styles.oacSubmitButton}
                onClick={handleSwitchToEdit}
              >
                Modificar
              </button>
              </div>
            )}
    
          {!isReadOnly && (
            <div className={`${styles.oacButtonContainer} ${(currentMode === 'edit' ? 1 : 0) + 1 === 1 ? styles.singleButton : ''}`}>
              
              {currentMode === 'edit' && (
                <>
                <button className={styles.oacSubmitButton} type="button" onClick={() => OacPDF(sac.id, oac.id)}>
                  Imprimir O.A.C
                </button>
                 <button className={styles.oacSubmitButton} type="button" onClick={handleEdit}>
                 Finalizar O.A.C
               </button>
               </>
              )}
              <button className={styles.oacSubmitButton} type="submit" onClick={handleSubmit}>
                {currentMode === 'edit' ? 'Grabar (Sin Finalizar)' : 'Crear O.A.C'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
    

  };

  export default OacForm;
 */