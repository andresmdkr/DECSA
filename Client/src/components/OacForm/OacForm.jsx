  import React, { useState, useEffect, useRef } from 'react';
  import { AiOutlineClose } from 'react-icons/ai';
  import styles from './OacForm.module.css';
  import { createOac, updateOac } from '../../redux/slices/oacSlice';
  import { useDispatch,useSelector } from 'react-redux';
  import OacPDF from '../OacPDF/OacPDF';
  import Swal from 'sweetalert2';
  import tensionOptions from './tensionOptions.json'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const OacForm = ({ sac, onClose, oac, mode: initialMode, onOacCreated }) => {
  /*   const eventDate = sac.eventDate ? new Date(sac.eventDate).toISOString().split('T')[0] : '';   */

    const now = new Date();
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

  /*   useEffect(() => {
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
            ? oac.files.map((file) => ({ name: file.split('\\').pop(), isNew: false, url: `/uploads/oac/OAC-${oac.id}/${file.split('\\').pop()}` }))
            : [];
          setSelectedFiles(existingFiles);
        }
      }
    }, [currentMode, oac]); */

    useEffect(() => {
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
                  url: `/uploads/oac/OAC-${oac.id}/${fileName}`, // Genera la URL correctamente
                };
              })
            : [];
            
          setSelectedFiles(existingFiles);
        }
      }
    }, [currentMode, oac]);
    


    useEffect(() => {
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
                 Cerrar O.A.C
               </button>
               </>
              )}
              <button className={styles.oacSubmitButton} type="submit" onClick={handleSubmit}>
                {currentMode === 'edit' ? 'Grabar' : 'Crear O.A.C'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
    

  };

  export default OacForm;
