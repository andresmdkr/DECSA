import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './OtForm.module.css';
import { createWorkOrder, updateWorkOrder } from '../../redux/slices/otSlice';
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice';
import OtPDF from '../OtPDF/OtPDF';
import { useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';

import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const OtForm = ({ sac, onClose, ot, mode, origen,artifact}) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState('In Progress');
  const [reason, setReason] = useState('Personalizado');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState(null);
  const [technicalService, setTechnicalService] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

    // Estados para "Estado de Instalación"
    const [installationInterior, setInstallationInterior] = useState('');
    const [installationExterior, setInstallationExterior] = useState('');
    const [protectionThermal, setProtectionThermal] = useState(false);
    const [protectionBreaker, setProtectionBreaker] = useState(false);
    const [protectionOther, setProtectionOther] = useState('');
    const [customProtection, setCustomProtection] = useState('');

  const previousStatus = useRef(status);
  const fileInputRef = useRef(null);
  const technicalServices = useSelector(state => state.technicalService.technicalServices);


  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      if (ot) {
        setStatus(ot.status);
        setReason(ot.reason);
        setDescription(ot.description);
        setTechnicalService(ot.technicalService);
        
        // Cargar datos de instalación si existen
        setInstallationInterior(ot.installationInterior || null);
        setInstallationExterior(ot.installationExterior || null);
        setProtectionThermal(ot.protectionThermal || false);
        setProtectionBreaker(ot.protectionBreaker || false);
        setProtectionOther(ot.protectionOther ? true : false); // Si "Otros" está seleccionado
        setCustomProtection(ot.protectionOther || '');
        
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


/*   useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      if (ot) {
        setStatus(ot.status);
        setReason(ot.reason);
        setDescription(ot.description);
        setTechnicalService(ot.technicalService);

        // Actualizamos el manejo de archivos para sistemas Unix/Linux
        const existingFiles = ot.files
          ? ot.files.map((file) => {
              const fileName = file.split('/').pop(); // Ajustado para Unix/Linux
              return {
                name: fileName,
                isNew: false,
                url: `/uploads/OT/OT-${ot.id}/${fileName}`, // Genera la URL correctamente
              };
            })
          : [];
          
        setSelectedFiles(existingFiles);
      }
    }
  }, [mode, ot]); */
  

  useEffect(() => {
    dispatch(fetchAllTechnicalServices());
  }, [dispatch]);

  useEffect(() => {
        if (sac.clientId) {
          dispatch(fetchClientByAccountNumber(sac.clientId))
            .unwrap()
            .then(setClient)
            .catch((error) => console.error('Error fetching client:', error));
        }
      }, [sac.clientId, dispatch]);


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
    console.log(customProtection)
    const workOrderData = {
      status,
      reason,
      description,
      technicalService,
      installationInterior: installationInterior ? installationInterior : null,
      installationExterior: installationExterior ? installationExterior : null,
      protectionThermal,
      protectionBreaker,
      protectionOther: protectionOther ? customProtection : '',
      files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
    };
  
    try {
      if (mode === 'edit') {
        await dispatch(updateWorkOrder({ workOrderId: ot.id, workOrderData }));
        Swal.fire({
          title: `Orden de Trabajo #${ot.id} actualizada con éxito`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Imprimir',
          cancelButtonText: 'Cerrar',
        }).then((result) => {
          if (result.isConfirmed) {
            handlePrint();
           /*  OtPDF({sac, ot, artifact,client }); */
          }
          onClose(); 
        });
      } else {
        const response = await dispatch(createWorkOrder({ sacId:sac.id, workOrderData }));
        Swal.fire({
          title: 'Orden de Trabajo creada con éxito',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Imprimir',
          cancelButtonText: 'Cerrar',
        }).then((result) => {
          if (result.isConfirmed) {
            OtPDF({sac, ot, artifact,client });
          }
          onClose();            
        });
      }
    } catch (error) {
      console.error('Error al procesar la Orden de Trabajo:', error);
      Swal.fire({
        title: 'Error al guardar',
        text: 'No se pudo guardar la Orden de Trabajo. Inténtalo de nuevo.',
        icon: 'error',
      });
    }
  };
  

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
  };

  const handlePrint = async () => {
    if (mode === 'edit' && ot) {
      const updatedWorkOrderData = {
        status,
        reason,
        description,
        technicalService,
        installationInterior: installationInterior ? installationInterior : null,
        installationExterior: installationExterior ? installationExterior : null,
        protectionThermal,
        protectionBreaker,
        protectionOther: protectionOther ? customProtection : '',
        files: selectedFiles.map((f) => (f.isNew ? f.file : f.name)),
      };
      
      try {
        await dispatch(updateWorkOrder({ workOrderId: ot.id, workOrderData: updatedWorkOrderData }));
        OtPDF({ sac, ot: { ...ot, ...updatedWorkOrderData }, artifact,client });
      } catch (error) {
        console.error('Error al actualizar antes de imprimir:', error);
        Swal.fire({
          title: 'Error al actualizar',
          text: 'No se pudo actualizar la Orden de Trabajo antes de imprimir.',
          icon: 'error',
        });
      }
    } else {
      OtPDF({ sac, ot, artifact,client });
    }
  };

    const customSelectStyles = {
      container: (provided) => ({
          ...provided,
          width: '100%',
          marginRight: '16px',
      }),
      menu: (provided) => ({
          ...provided,
          maxHeight: '150px', 
          overflowY: 'auto', 
      }),
      menuList: (provided) => ({
          ...provided,
          maxHeight: '150px',
          overflowY: 'auto',  
          scrollbarWidth: 'thin', 
      }),
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
        {artifact && (
                    <h3 className={styles.miniTitle}>
                        {`Reclamo Artefacto (${artifact.name})`}
                    </h3>
        )}

        <div className={styles.otFormContainer}>
          <form onSubmit={handleSubmit}>
          {mode !== 'create' && origen !== 'artefacto' && ( 
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
            {origen !== 'artefacto' && ( 
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
              )}

              {reason === 'Artefacto Quemado' && ( 
              <div className={styles.inlineGroup}>
                <label className={styles.otLabel} htmlFor="technicalService">Servicio técnico encargado:</label>
                <Select
                  id="technicalService"
                  name="technicalService"
                  options={technicalServices
                    ?.filter((service) => service.area?.toLowerCase() === 'artefactos')
                    .map((service) => ({
                      value: service.name,
                      label: service.name,
                    }))
                  }
                  value={
                    technicalServices?.find(
                      (service) => service.name === technicalService
                    )
                    ? { value: technicalService, label: technicalService }
                    : null
                  }
                  onChange={(selectedOption) =>
                    setTechnicalService(selectedOption.value)
                  }
                  styles={customSelectStyles}
                  isDisabled={mode === 'view'}
                  placeholder="Seleccionar servicio técnico"
                />
              </div>
            )}

            <hr className={styles.separator} />


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
            {reason === 'Artefacto Quemado' && ( 
              <>
            <div className={styles.sectionContainer}>
              <label className={styles.otLabel}>Estado de la Instalación:</label>
              <div className={styles.installationWrapper}>
                {/* Instalación Interior */}
                <div className={styles.installationBlock}>
                  <label className={styles.subTitle}>Instalación Interior:</label>
                  <div className={styles.radioGroupVertical}>
                    {['Buena', 'Regular', 'Mala'].map((estado) => (
                      <label key={estado} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="installationInterior"
                          value={estado}
                          checked={installationInterior === estado}
                          onChange={(e) => setInstallationInterior(e.target.value)}
                          disabled={isReadOnly}
                        />
                        {estado}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Instalación Exterior */}
                <div className={styles.installationBlock}>
                  <label className={styles.subTitle}>Instalación Exterior:</label>
                  <div className={styles.radioGroupVertical}>
                    {['Buena', 'Regular', 'Mala'].map((estado) => (
                      <label key={estado} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="installationExterior"
                          value={estado}
                          checked={installationExterior === estado}
                          onChange={(e) => setInstallationExterior(e.target.value)}
                          disabled={isReadOnly}
                        />
                        {estado}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Protecciones */}
                <div className={styles.installationBlock}>
                  <label className={styles.subTitle}>Protecciones:</label>
                  <div className={styles.protectionContainer}>
                    {[{ label: 'Térmica', state: protectionThermal, setState: setProtectionThermal },
                      { label: 'Disyuntor', state: protectionBreaker, setState: setProtectionBreaker },
                      { label: 'Otros', state: protectionOther, setState: setProtectionOther }].map((item) => (
                      <label key={item.label} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={item.state}
                          onChange={(e) => item.setState(e.target.checked)}
                          disabled={isReadOnly}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  {protectionOther && (
                    <input
                      type="text"
                      className={styles.customProtectionInput}
                      value={customProtection}
                      onChange={(e) => setCustomProtection(e.target.value)}
                      placeholder="Especifique tipo de protección"
                      maxLength={50}
                      readOnly={isReadOnly}
                    />
                  )}
                </div>
              </div>
            </div>

            <hr className={styles.separator} />
            </>
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
