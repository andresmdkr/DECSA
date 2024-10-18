import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtifact, updateArtifact } from '../../redux/slices/artifactsSlice';
import { fetchWorkOrders, createWorkOrder, updateWorkOrder } from '../../redux/slices/otSlice';
import { fetchResolutions } from '../../redux/slices/resolutionSlice'; 
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';
import styles from './Artifact.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import Swal from 'sweetalert2';
import OtPDF from '../OtPDF/OtPDF';
import ResolutionForm from '../ResolutionForm/ResolutionForm';
import Select from 'react-select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const Artifact = ({ sacId, artifactId, onUpdate, onClose, mode = 'edit' }) => {
    const dispatch = useDispatch();
    const artifact = useSelector(state => state.artifacts.artifact);
    const workOrders = useSelector(state => state.ot.workOrders);
    const resolutions = useSelector(state => state.resolution.resolutions);
    const [formData, setFormData] = useState({
        status: '',
        technicalService: '',
        technicalReport: '',
        conclusion: '',
        budget: ''
    });
    const [showResolutionForm, setShowResolutionForm] = useState(false); 
    const [resolutionMode, setResolutionMode] = useState('create'); 
    const [resolution, setResolution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [currentMode, setCurrentMode] = useState(mode); 
    const [errorMessage, setErrorMessage] = useState('');

    const technicalServices = useSelector(state => state.technicalService.technicalServices);

/*     useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(fetchArtifact(artifactId));
            await dispatch(fetchResolutions({ burnedArtifactId: artifactId }));
            const res = await dispatch(fetchWorkOrders({ burnedArtifactId: artifactId }));
            
            const filesFromWorkOrder = res.payload[0]?.files || [];
            const existingFiles = filesFromWorkOrder.map((file) => ({
                name: file.split('\\').pop(),
                isNew: false,
                url: `/uploads/OT/OT-${res.payload[0].id}/${file.split('\\').pop()}`,
            }));
            setSelectedFiles(existingFiles);
            setLoading(false);
        };
        
        if (artifactId) {
            fetchData();
        }
    }, [dispatch, artifactId]); */

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(fetchArtifact(artifactId));
            const res = await dispatch(fetchWorkOrders({ burnedArtifactId: artifactId }));
            
            const filesFromWorkOrder = res.payload[0]?.files || [];
            
            const existingFiles = filesFromWorkOrder.map((file) => {
                const fileName = file.split('/').pop(); // Ajustado para Unix/Linux
                return {
                    name: fileName,
                    isNew: false,
                    url: `/uploads/OT/OT-${res.payload[0].id}/${fileName}`, // Asegurarse que esté bien formada la URL
                };
            });
            
            setSelectedFiles(existingFiles);
            setLoading(false);
        };
    
        if (artifactId) {
            fetchData();
        }
    }, [dispatch, artifactId]);
 

    useEffect(() => {
        dispatch(fetchAllTechnicalServices());
    }, [dispatch]);

    useEffect(() => {
        if (artifact) {
            setFormData({
                status: artifact.status === 'Completed' ? 'Completed' : 'In Progress',
                technicalService: artifact.technicalService || '',
                technicalReport: artifact.technicalReport || '',
                conclusion: artifact.conclusion || '',
                budget: artifact.budget || '',
            });
        }
    }, [artifact]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
        const tooLargeFiles = files.filter(file => file.size > MAX_FILE_SIZE);

        if (tooLargeFiles.length > 0) {
            setErrorMessage('Uno o más archivos superan el tamaño máximo de 50 MB.');
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


    const handleSave = async (showAlert = true) => {
        let updatedStatus = formData.status; 
        if (formData.status === 'Completed') {
            const result = await Swal.fire({
                title: '¿Seguro que quieres cerrar el artefacto?',
                text: 'El estado pasará a "Cerrado" y no podrás modificarlo.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar',
                cancelButtonText: 'No, volver a "En curso"'
            });
        }
    
 
        const updatedFormData = { ...formData, status: updatedStatus };
    
    
        await dispatch(updateArtifact({ artifactId, artifactData: updatedFormData }))
        .then(() => {
            onUpdate(artifactId, updatedFormData.status);

            if (showAlert) {
                Swal.fire({
                    title: '¡Artefacto actualizado!',
                    text: `Artefacto #${artifactId} editado con éxito`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                });
            }
        });

        const workOrderData = {
            status: updatedStatus,
            reason: 'Artefacto Quemado',
            description: `Reparar artefacto ${artifact.name} / ${artifact.model} / ${artifact.serialNumber}`,
            files: selectedFiles.map(f => f.isNew ? f.file : f.name)
        };
    

        if (workOrders.length === 0) {
            await dispatch(createWorkOrder({ sacId, burnedArtifactId: artifactId, workOrderData }));
        } else {
            const existingWorkOrder = workOrders[0];
            await dispatch(updateWorkOrder({ workOrderId: existingWorkOrder.id, workOrderData }));
        }
    
        onClose();
    };
    
    

    const handleBudgetChange = (e) => {
        const valueWithoutDollar = e.target.value.replace(/\$/g, '');
        if (!isNaN(valueWithoutDollar)) {
            setFormData({ ...formData, budget: valueWithoutDollar });
        }
    };
    

    const handlePrint = async () => {
        await handleSave(false);
        OtPDF(sacId, artifactId);

    };

    const handlePrint2 = async () => {
        await handleSave(false);
        OtPDF(sacId, artifactId);
    };


    const handleEdit = async () => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Vas a cambiar el estado del artefacto para editarlo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, editar',
            cancelButtonText: 'Cancelar',
        });
    
        if (result.isConfirmed) {
            setCurrentMode('edit'); 
        }
    };

    
    

    const handleResolutionClick = () => {
        
        const existingResolution = resolutions.find(res => res.burnedArtifactId
            === artifactId);

        setResolution(existingResolution);

        if (existingResolution) {
            if (existingResolution.status === 'Completed') {
                setResolutionMode('view');
            } else {
                setResolutionMode('edit');
            }
        } else {
            setResolutionMode('create');
        }

        setShowResolutionForm(true);
    };

    const closeResolutionForm = () => {
        setShowResolutionForm(false);
    };
    

    const customSelectStyles = {
        container: (provided) => ({
            ...provided,
            width: '100%',
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
    
    

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.title}>Detalles de Artefacto</h2>

                {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                ) : (
                    <>
                        <div className={styles.artifactDetails}>
                            <p><strong>Artefacto a reparar:</strong> {artifact.name} / {artifact.brand} / {artifact.model} / {artifact.serialNumber}</p>
                            <p><strong>Documentación adicional:</strong> {artifact.documentation}</p>
                        </div>
                        <hr className={styles.divider} />

                        <div className={styles.formScrollable}>
                            <div className={styles.inlineGroup}>
                                <label htmlFor="status"><strong>Estado:</strong></label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={styles.statusSelect}
                                    disabled={currentMode === 'view'}  
                                >
                                    <option value="In Progress">En curso</option>
                                    <option value="Completed">Cerrado</option>
                                </select>
                            </div>

                            <div className={styles.inlineGroup}>
                                <label htmlFor="technicalService"><strong>Servicio técnico:</strong></label>
                                <Select
                                    id="technicalService"
                                    name="technicalService"
                                    options={technicalServices.map((service) => ({
                                        value: service.name,
                                        label: service.name,
                                    }))}
                                    value={
                                        technicalServices.find(
                                            (service) => service.name === formData.technicalService
                                        )
                                        ? { value: formData.technicalService, label: formData.technicalService }
                                        : null
                                    }
                                    onChange={(selectedOption) =>
                                        setFormData({ ...formData, technicalService: selectedOption.value })
                                    }
                                    styles={customSelectStyles} 
                                    isDisabled={currentMode === 'view'}
                                    placeholder="Seleccionar servicio técnico"
                                />

                            </div>
                            <hr className={styles.divider} />
    
                                <div className={styles.formGroup}>
                                    <label htmlFor="technicalReport"><strong>Informe técnico:</strong></label>
                                    <textarea
                                        id="technicalReport"
                                        name="technicalReport"
                                        value={formData.technicalReport}
                                        onChange={handleChange}
                                        className={styles.textareaField}
                                        maxLength={1000}
                                        disabled={currentMode === 'view'}  
                                    />
                                </div>
    
    
                            <div className={styles.formGroup}>
                                <label htmlFor="budget"><strong>Presupuesto:</strong></label>
                                <input
                                    type="text"
                                    id="budget"
                                    name="budget"
                                    value={`$${formData.budget}`}
                                    onChange={handleBudgetChange}
                                    className={styles.inputField}
                                    maxLength={250}
                                    disabled={currentMode === 'view'}  
                                />
                            </div>
                            
                    
                            {selectedFiles.length > 0 && ( 
                                <><hr className={styles.divider} />
                            <div className={styles.fileList}>
                                
                                <h3>Archivos:</h3>
                                
                                <ul >
                                    {selectedFiles.map((file) => (
                                        <li key={file.name}>
                                            {file.isNew ? (
                                                <>
                                                    {file.name}
                                                    {currentMode === 'edit' && ( 
                                                        <button
                                                            type="button"
                                                            className={styles.fileRemoveButton}
                                                            onClick={() => handleFileRemove(file.name)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={styles.fileLinkButton}
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
                            </>
)}
                            {currentMode === 'edit' && ( 
                                <div className={styles.formGroup}>
                                    <label><strong>Subir archivos (máximo 50 MB por archivo):</strong></label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className={styles.fileInput}
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </div>
                            )}
                            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                        </div>

                        {currentMode === 'edit' && ( 
                            <div className={styles.buttonContainer}>
                                 <button onClick={handleResolutionClick} className={styles.resolutionButton}>
                                Resolución
                                </button>
                                <button onClick={handlePrint} className={styles.printButton}>
                                    O.Trabajo
                                </button>
                                <button onClick={handlePrint2} className={styles.printButton}>
                                    O.Reparacion
                                </button>
                                <button onClick={handleSave} className={styles.saveButton}>
                                    Grabar
                                </button>
                            </div>
                        )}
                        {currentMode === 'view' && (
                            <div className={styles.buttonContainer}>
                                <button onClick={onClose} className={styles.cancelButton}>
                                    Cerrar
                                </button>
                                <button onClick={handleResolutionClick} className={styles.resolutionButton}>
                                Resolución
                                </button>
                                <button onClick={handleEdit} className={styles.editButton}>
                                   Modificar
                                </button>

                            </div>
                        )}
     {showResolutionForm && (
                            <ResolutionForm
                                
                                sacId={sacId}
                                burnedArtifactId={artifactId}
                                resolution={resolution}
                                mode={resolutionMode}
                                onClose={closeResolutionForm}
                            />
                        )}

                    </>
                )}
                
            </div>
        </div>
    );
};

export default Artifact;
