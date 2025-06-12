import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './OacForm.module.css';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { createOac, updateOac, fetchOACs } from '../../redux/slices/oacSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';
import { updateSAC } from '../../redux/slices/sacsSlice';
import OacXLSX from '../OacXLSX/OacXLSX';
import Swal from 'sweetalert2';
import tensionOptions from './tensionOptions.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const OacForm = ({ sac, oac, onClose, mode }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // -------------------- Estados --------------------
  const [oacNumber, setOacNumber] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [assignedPerson, setAssignedPerson] = useState(sac.assignedTo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mainFile, setMainFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [formMode, setFormMode] = useState(mode);
  const [oacStatus, setOacStatus] = useState(oac?.status || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [tension, setTension] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [performedWork, setPerformedWork] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');

  const technicalServices = useSelector((state) => state.technicalService.technicalServices);

  const failureReasons = tension ? tensionOptions[tension]?.failureReasons || [] : [];
  const performedWorks = tension ? tensionOptions[tension]?.performedWorks || [] : [];

  const isReadOnly = formMode === 'view';
  // -------------------- useEffect --------------------
  useEffect(() => {
    setFormMode(mode);
  }, [mode]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setAssignedBy(`${user.name} ${user.lastName}`);
  }, []);

  useEffect(() => {
    dispatch(fetchAllTechnicalServices());

    if (sac.clientId) {
      dispatch(fetchClientByAccountNumber(sac.clientId))
        .unwrap()
        .then(setClient)
        .catch((err) => console.error('Error fetching client:', err));
    }

    if (formMode !== 'create' && oac) {
      setOacNumber(String(oac.id));
      setAssignedPerson(oac.assignedPerson || '');
      setTension(oac.tension || '');
      setFailureReason(oac.failureReason || '');
      setPerformedWork(oac.performedWork || '');
      setPendingTasks(oac.pendingTasks || '');
      setMainFile(oac.mainFile ? [{
        name: oac.mainFile.split('\\').pop(),
        isNew: false,
        url: `/uploads/OAC/OAC-${oac.id}/${oac.mainFile.split('\\').pop()}`
      }] : []);

      setSelectedFiles(
        oac.files?.map((f) => ({
          name: f.split('\\').pop(),
          isNew: false,
          url: `uploads/OAC/OAC-${oac.id}/${f.split('\\').pop()}`
        })) || []
      );
    }
  }, [dispatch, sac.clientId, formMode, oac]);

  // -------------------- Técnicos agrupados --------------------
  const groupedByType = {
    'personal propio': [],
    contratista: [],
    redes: [],
  };

  technicalServices
    .filter((s) => s.area === 'operaciones')
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((agent) => {
      if (groupedByType[agent.type]) groupedByType[agent.type].push(agent);
    });

  // -------------------- Utils --------------------
  const renameFileIfDuplicate = (file, existingFiles) => {
    let name = file.name, count = 1;
    const ext = file.name.split('.').pop();
    let base = name.replace(`.${ext}`, '');

    while (existingFiles.some((f) => f.name === name)) {
      name = `${base}(${count++}).${ext}`;
    }

    return new File([file], name, { type: file.type });
  };

  const downloadFile = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  // -------------------- Handlers de archivo --------------------
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const tooLarge = files.filter((f) => f.size > MAX_FILE_SIZE);

    if (tooLarge.length) {
      setErrorMessage('Uno o más archivos superan el tamaño máximo de 50 MB.');
    } else {
      const renamed = files.map((f) => renameFileIfDuplicate(f, selectedFiles));
      setSelectedFiles([
        ...selectedFiles,
        ...renamed.map((f) => ({ file: f, name: f.name, isNew: true })),
      ]);
      setErrorMessage('');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileRemove = (fileName) => {
    setSelectedFiles(selectedFiles.filter((f) => f.name !== fileName));
  };

  const handleMainFileUpdate = (e) => {
    const file = e.target.files[0];
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!file) return;
    setUploadedFileName(file.name);

    if (!allowed.includes(file.type)) {
      setErrorMessage('El archivo debe ser Excel (.xlsx o .xls).');
    } else if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('El archivo supera el tamaño máximo de 50 MB.');
    } else {
      const newName = mainFile?.[0]?.name || file.name;
      setMainFile([{ file: new File([file], newName, { type: file.type }), name: newName, isNew: true }]);
      setErrorMessage('');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -------------------- Handlers generales --------------------
  const handleOacNumberChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 20) setOacNumber(val);
  };

  const handleAssignedPersonChange = (e) => {
    setAssignedPerson(e.target.value);
  };

  // -------------------- Envío formulario --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (formMode === 'create') {
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
          assignedBy,
          assignedPerson,
          mainFile: blob,
          files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
          tension,
          failureReason,
          performedWork,
          pendingTasks,
        };

        const response = await dispatch(createOac({ sacId: sac.id, oacData })).unwrap();

        Swal.fire({ icon: 'success', title: `OAC creada con éxito (ID: ${response.id})` });
        setOacNumber(String(response.id));
        setOacStatus('Open');
        setFormMode('edit');
        setMainFile([{
          name: `OAC_${response.id}.xlsx`,
          isNew: false,
          url: `/uploads/OAC/OAC-${response.id}/OAC_${response.id}.xlsx`,
        }]);
        setSelectedFiles([]);
        return;

      } else if (formMode === 'edit') {
        const oacData = {
          id: oacNumber,
          assignedPerson,
          mainFile: mainFile?.[0]?.file || undefined,
          files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
          tension,
          failureReason,
          performedWork,
          pendingTasks,
        };
        await dispatch(updateOac({ oacId: oacNumber, sacId: sac.id, oacData }));
        Swal.fire({ icon: 'success', title: 'OAC actualizada con éxito' });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: error.status === 409 ? 'OAC duplicada' : 'Error',
        text: error.data?.message || error.message || 'Hubo un error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Finalización de OAC --------------------
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

        await dispatch(updateOac({ oacId: oacNumber, oacData: { status: 'Open' } }));
        setOacStatus('Open');
        setFormMode('edit');
        return;
      }

      const confirm = await Swal.fire({
        title: `¿Desea finalizar esta OAC?`,
        text: 'Una vez finalizada, no podrá editarse.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar',
      });
      if (!confirm.isConfirmed) return;

      const oacData = {
        id: oacNumber,
        assignedPerson,
        mainFile: mainFile?.[0]?.file || undefined,
        files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
        status: 'Completed',
        tension,
        failureReason,
        performedWork,
        pendingTasks,
      };
      await dispatch(updateOac({ oacId: oacNumber, sacId: sac.id, oacData }));
      setOacStatus('Completed');

      if (sac.status !== 'Closed') {
        const closeSacConfirm = await Swal.fire({
          title: `¿Desea cerrar también la SAC #${sac.id}?`,
          text: 'Esto marcará la SAC como cerrada.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, cerrar SAC',
          cancelButtonText: 'No cerrar',
        });

        if (closeSacConfirm.isConfirmed) {
          const user = JSON.parse(localStorage.getItem('user'));
          const now = new Date();
          const argNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));

          const updatedData = {
            ...sac,
            status: 'Closed',
            closeDate: argNow.toISOString().split('T')[0],
            closeTime: argNow.toTimeString().split(' ')[0],
            closedBy: `${user.name} ${user.lastName}`,
          };

          await dispatch(updateSAC({ id: sac.id, sacData: updatedData }));
          Swal.fire({ icon: 'success', title: 'SAC cerrada con éxito' });
          onClose({ sacStatus: 'Closed', oacStatus: 'Completed' });
          return;
        } else {
          Swal.fire({ icon: 'info', title: 'OAC finalizada', text: 'La SAC permanece abierta.' });
        }
      } else {
        Swal.fire({ icon: 'success', title: 'OAC finalizada con éxito' });
      }

      onClose({ sacStatus: sac.status, oacStatus: 'Completed' });

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

  const handleClose = () => {
    onClose({ sacStatus: sac?.status || 'Open', oacStatus });
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


 return (
  <div className={styles.oacModalOverlay}>
      <div className={`${styles.oacModalWrapper} ${formMode === 'create' ? styles.soloPrincipal : ''}`}>
        <div className={styles.oacModalHeader}>
          <button className={styles.oacCloseButton} onClick={handleClose}>
            <AiOutlineClose />
          </button>

          <h2 className={styles.oacTitle}>
            {formMode === 'create' ? 'Crear Nueva O.A.C' : `Editar O.A.C #${oacNumber}`}
          </h2>
</div>

 <div className={styles.oacModalBody}>
        <div className={styles.oacMainPanel}>

          <div className={styles.oacFormContainer}>
            {/* Número de OAC */}
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
            {/* Persona a cargo */}
            <div className={styles.inlineGroup}>
              <label className={styles.oacLabel}>Persona a cargo:</label>
              <select
                className={`${styles.oacSelect} ${formMode === 'view' ? styles.disabledSelect : ''}`}
                value={assignedPerson}
                onChange={handleAssignedPersonChange}
                disabled={formMode === 'view'}
              >
                <option value="">Seleccionar...</option>
                {Object.entries(groupedByType).map(([group, agents]) => (
                  <optgroup key={group} label={capitalize(group)}>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.name}>
                        {agent.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
        
         
   
            {/* Archivo Excel principal */}
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
                      onChange={handleMainFileUpdate}
                      disabled={formMode === 'create'}
                      accept=".xlsx,.xls"
                    />

                    {formMode !== 'view' && (
                      <label htmlFor="uploadFile" className={styles.actionButton}>
                        Subir archivo modificado
                      </label>
                    )}
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
            {/* Errores */}
            {errorMessage && <p className={styles.oacErrorMessage}>{errorMessage}</p>}
      </div>
            
     <div className={styles.oacModalContent}>

            {/* Otros archivos */}
            {selectedFiles.length > 0 && (
              <div className={styles.oacFileList}>
                <h3>Otros Archivos:</h3>
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
                        <button
                          type="button"
                          className={styles.oacFileLinkButton}
                          onClick={() => window.open(`${API_BASE_URL}/${file.url}`, '_blank')}
                        >
                          {file.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subir otros archivos */}
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
            </div>
            
       
          

          
  </div>
  {/* Tensión, Motivo de Falla, Trabajos Realizados, Tareas Pendientes */}
         {formMode !== 'create' && (
    <div className={styles.oacSidePanel}>
      <div className={styles.inlineGroup}>
        <label className={styles.oacLabel}>Tipo de Tensión:</label>
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

      {tension && (
        <>
          <div className={styles.inlineGroup}>
            <label className={styles.oacLabel}>Motivo de la Falla:</label>
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
            <label className={styles.oacLabel}>Trabajos Realizados:</label>
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
            <label className={styles.oacLabel}>Tareas Pendientes:</label>
            <textarea
              className={styles.oacTextarea}
              value={pendingTasks}
              onChange={(e) => setPendingTasks(e.target.value)}
              placeholder="Tareas pendientes"
              maxLength={1000}
              readOnly={isReadOnly}
            />
          </div>
        </>
      )}
    </div>
  )}
{/* Botones */}
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
                  ? formMode === 'view'
                    ? 'Reabriendo...'
                    : 'Finalizando...'
                  : formMode === 'view'
                  ? 'Reabrir O.A.C'
                  : 'Finalizar O.A.C'}
              </button>
            )}

            {formMode === 'create' || formMode === 'edit' ? (
              <button
                className={styles.oacSubmitButton}
                onClick={handleSubmit}
                disabled={!oacNumber.trim() || isLoading}
              >
                {isLoading
                  ? 'Procesando...'
                  : formMode === 'create'
                  ? 'Crear Nueva O.A.C'
                  : 'Guardar Cambios'}
              </button>
            ) : null}

     
    </div>
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