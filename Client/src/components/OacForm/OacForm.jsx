  import React, { useState, useEffect, useRef } from 'react';
  import { AiOutlineClose } from 'react-icons/ai';
  import styles from './OacForm.module.css';
  import { createOac, updateOac } from '../../redux/slices/oacSlice';
  import { useDispatch,useSelector } from 'react-redux';
  import OacPDF from '../OacPDF/OacPDF';
  import Swal from 'sweetalert2';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const OacForm = ({ sac, onClose, oac, mode }) => {
    const eventDate = sac.eventDate ? new Date(sac.eventDate).toISOString().split('T')[0] : '';  
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
    
    const [status, setStatus] = useState('In Progress');
    const [issueDate, setIssueDate] = useState(eventDate);
    const [issueTime, setIssueTime] = useState(sac.startTime);
    const [workDescription, setWorkDescription] = useState('');
    const [pendingTasks, setPendingTasks] = useState('');
    const [assignedPerson, setAssignedPerson] = useState('');
    const [assignmentTime, setAssignmentTime] = useState('');
    const [oacReason, setOacReason] = useState(`${sac.claimReason}: ${sac.description}`);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
 

    const fileInputRef = useRef(null); 

    useEffect(() => {
      if (mode === 'edit' || mode === 'view') {
        if (oac) {
          setStatus(oac.status);
          setIssueDate(oac.issueDate);
          setIssueTime(oac.issueTime);
          setWorkDescription(oac.workDescription);
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
    }, [mode, oac]);

 
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
      if (status === 'Completed') {
        
        Swal.fire({
          title: `¿Está seguro de cerrar la OAC #${oacId}?`,
          text: "Esta acción no se puede deshacer.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cerrar OAC',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            await dispatch(updateOac({ sacId, oacId, oacData }));
            Swal.fire(
              'Cerrada',
              `La OAC #${oacId} ha sido cerrada.`,
              'success'
            );
          }
        });
      } else {
        await dispatch(updateOac({ sacId, oacId, oacData }));
        
        Swal.fire({
          title: `OAC #${oacId} editada con éxito`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });
      }
    };
    
          

    const handleSubmit = async (e) => {
      e.preventDefault();

      const oacData = {
        status,
        issueDate,
        issueTime,
        assignedPerson,
        assignedBy: `${user?.name} ${user?.lastName}`,
        assignmentTime,
        oacReason,
        workDescription,
        pendingTasks,
        files: selectedFiles.map(f => f.isNew ? f.file : f.name), 
      };

      try {
        if (mode === 'edit') {
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
          handleSuccessAlert(newOacId); 
        }
        onClose();
      } catch (error) {
        console.error('Error al procesar la OAC:', error);
      }
    };

    const isReadOnly = mode === 'view';

    return (
      <div className={styles.oacModalOverlay}>
        <div className={styles.oacModalContent}>
          <button className={styles.oacCloseButton} onClick={onClose}>
            <AiOutlineClose />
          </button>
          <h2 className={styles.oacTitle}>
            {mode === 'edit' ? `O.A.C #${oac.id}` : mode === 'view' ? `O.A.C #${oac.id} (Cerrada)` : 'Nueva O.A.C'}
          </h2>
    
          <div className={styles.oacFormContainer}>
            <form onSubmit={handleSubmit}>
              {mode !== 'create' && (
                <div className={styles.inlineGroup}>
                  <label className={styles.oacLabel}>Estado:</label>
                  <select
                    className={styles.oacSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option value="In Progress">En Curso</option>
                    <option value="Completed">Cerrado</option>
                  </select>
                </div>
              )}
    
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
                  className={`${styles.oacInput} ${styles.longInput}`}
                  value={oacReason}
                  onChange={(e) => setOacReason(e.target.value)}
                  placeholder="Motivo de la O.A.C"
                  readOnly={isReadOnly}
                  maxLength={250}
                />
              </div>


              <hr className={styles.separator} />
    
              {mode !== 'create' && (
                <>
                 <div className={styles.textareaGroup}>
                        <label className={styles.oacLabel}>Descripción del trabajo realizado:</label>
                        <textarea
                          className={styles.oacTextarea} 
                          value={workDescription}
                          onChange={(e) => setWorkDescription(e.target.value)}
                          placeholder="Descripción del trabajo"
                          maxLength={1000}
                          readOnly={isReadOnly}
                        />
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
                    <label className={styles.oacLabel}>
                      Subir archivos (máximo 50 MB por archivo):
                      <input
                        ref={fileInputRef}
                        type="file"
                        className={styles.oacFileInput}
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                  {errorMessage && <p className={styles.oacErrorMessage}>{errorMessage}</p>}
                </>
              )}
            </form>
          </div>
    
          {!isReadOnly && (
            <div className={`${styles.oacButtonContainer} ${(mode === 'edit' ? 1 : 0) + 1 === 1 ? styles.singleButton : ''}`}>
              {mode === 'edit' && (
                <button className={styles.oacSubmitButton} type="button" onClick={() => OacPDF(sac.id, oac.id)}>
                  Imprimir O.A.C
                </button>
              )}
              <button className={styles.oacSubmitButton} type="submit" onClick={handleSubmit}>
                {mode === 'edit' ? 'Grabar' : 'Crear O.A.C'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
    

  };

  export default OacForm;
