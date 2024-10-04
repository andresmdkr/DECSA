import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtifact, updateArtifact } from '../../redux/slices/artifactsSlice';
import { fetchWorkOrders, createWorkOrder, updateWorkOrder } from '../../redux/slices/otSlice';
import styles from './Artifact.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import Swal from 'sweetalert2';
import OtPDF from '../OtPDF/OtPDF';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const Artifact = ({ sacId, artifactId, onUpdate, onClose, mode = 'edit' }) => {
    const dispatch = useDispatch();
    const artifact = useSelector(state => state.artifacts.artifact);
    const workOrders = useSelector(state => state.ot.workOrders);
    const [formData, setFormData] = useState({
        status: '',
        technicalService: '',
        technicalReport: '',
        conclusion: '',
        budget: ''
    });
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
  
    const [errorMessage, setErrorMessage] = useState('');

/*     useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(fetchArtifact(artifactId));
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
    
            
            if (result.dismiss === Swal.DismissReason.cancel) {
                updatedStatus = 'In Progress'; 
            }
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
                                    disabled={mode === 'view'}  
                                >
                                    <option value="In Progress">En curso</option>
                                    <option value="Completed">Cerrado</option>
                                </select>
                            </div>

                            <div className={styles.inlineGroup}>
                                <label htmlFor="technicalService"><strong>Servicio técnico:</strong></label>
                                <input
                                    type="text"
                                    id="technicalService"
                                    name="technicalService"
                                    value={formData.technicalService}
                                    onChange={handleChange}
                                    className={styles.inputField}
                                    disabled={mode === 'view'}  
                                />
                            </div>
                            <hr className={styles.divider} />
                            <div className={styles.twoColumns}>
                                <div className={styles.formGroupHalf}>
                                    <label htmlFor="technicalReport"><strong>Informe técnico:</strong></label>
                                    <textarea
                                        id="technicalReport"
                                        name="technicalReport"
                                        value={formData.technicalReport}
                                        onChange={handleChange}
                                        className={styles.textareaField}
                                        maxLength={1000}
                                        disabled={mode === 'view'}  
                                    />
                                </div>
    
                                <div className={styles.formGroupHalf}>
                                    <label htmlFor="conclusion"><strong>Conclusión:</strong></label>
                                    <textarea
                                        id="conclusion"
                                        name="conclusion"
                                        value={formData.conclusion}
                                        onChange={handleChange}
                                        className={styles.textareaField}
                                        maxLength={1000}
                                        disabled={mode === 'view'} 
                                    />
                                </div>
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
                                    disabled={mode === 'view'}  
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
                                                    {mode === 'edit' && ( 
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
                            {mode === 'edit' && ( 
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

                        {mode === 'edit' && ( 
                            <div className={styles.buttonContainer}>
                                <button onClick={handlePrint} className={styles.printButton}>
                                    Imprimir O.T.
                                </button>
                                <button onClick={handleSave} className={styles.saveButton}>
                                    Grabar
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Artifact;
