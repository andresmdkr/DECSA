import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtifact, updateArtifact } from '../../redux/slices/artifactsSlice';
import { fetchWorkOrders, createWorkOrder} from '../../redux/slices/otSlice';
import { fetchResolutions } from '../../redux/slices/resolutionSlice'; 
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';
import { fetchRepairOrder,createRepairOrder } from '../../redux/slices/repairOrderSlice';
import styles from './Artifact.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import Swal from 'sweetalert2';

import ResolutionForm from '../ResolutionForm/ResolutionForm';
import OtForm from '../OtForm/OtForm';
import RepairOrderForm from '../RepairOrderForm/RepairOrderForm.jsx'


const Artifact = ({ sacId, artifactId, onUpdate, onClose, mode = 'edit' }) => {
    const dispatch = useDispatch();
    const artifact = useSelector(state => state.artifacts.artifact);
    const repairOrder = useSelector(state => state.repairOrder.repairOrder);
    const workOrders = useSelector(state => state.ot.workOrders);
    const resolutions = useSelector(state => state.resolution.resolutions);
    const [formData, setFormData] = useState({
        status: '',
    });
    const [showResolutionForm, setShowResolutionForm] = useState(false); 
    const [resolutionMode, setResolutionMode] = useState('create'); 
    const [resolution, setResolution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMode, setCurrentMode] = useState(mode); 
    const [errorMessage, setErrorMessage] = useState('');

    const [workOrder, setWorkOrder] = useState(null);  
    const [otMode, setOtMode] = useState('view');     

    const [repairOrderModalOpen, setRepairOrderModalOpen] = useState(false);
    const [repairOrderMode, setRepairOrderMode] = useState('view');


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(fetchArtifact(artifactId));
            await dispatch(fetchResolutions({ burnedArtifactId: artifactId }));
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

        /* const workOrderData = {
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
        } */
    
        onClose();
    };
    
        

    const handlePrint = async () => {
        await handleSave(false);
        OtPDF(sacId, artifactId);

    };

    const handlePrint2 = async () => {
        await handleSave(false);
        OtPDF(sacId, artifactId);
    };

    const closeWorkOrderForm = () => {
        setWorkOrder(null);
    };

    const openWorkOrderForm = () => {
        <OtForm 
            sacId={sacId} 
            onClose={closeWorkOrderForm} 
            ot={workOrder} 
            mode={otMode} 
            origen="artefacto" 
        />;
    };
    
    const closeRepairOrderForm = () => {
        setRepairOrderModalOpen(false);
    };
  
    const handleRepairOrderClick = async () => {
        const response = await dispatch(fetchRepairOrder({ burnedArtifactId: artifactId }));
        if (response.payload?.notFound) {
            const workOrderResponse = await dispatch(fetchWorkOrders({ sacId, burnedArtifactId: artifactId }));
            const workOrders = workOrderResponse.payload;
            const newRepairOrderData = {
                burnedArtifactId: artifactId,
                technicalService: workOrders[0]?.technicalService || '',
                budget: 0,
                technicalReport: ''
            };
            await dispatch(createRepairOrder({ repairOrderData: newRepairOrderData }));
            setRepairOrderMode('edit');
        } else {
            setRepairOrderMode(currentMode);
        }
        setRepairOrderModalOpen(true);
    };
    
    

 
    


    const handleWorkOrderClick = async () => {
 
        const response = await dispatch(fetchWorkOrders({ sacId, burnedArtifactId: artifactId }));
        const workOrders = response.payload;
    
        if (workOrders.length > 0) {
 
            const existingWorkOrder = workOrders[0];
            setWorkOrder(existingWorkOrder);
           setOtMode(currentMode)
        } else {
       
            const newWorkOrder = {
                reason: 'Artefacto Quemado',
                description: `Reparar artefacto ${artifact.name} / ${artifact.model} / ${artifact.serialNumber}`,
                status: 'In Progress'
            };
            const createdWorkOrder = await dispatch(createWorkOrder({ 
                sacId, 
                burnedArtifactId: artifactId, 
                workOrderData: newWorkOrder 
            }));

    
            setWorkOrder(createdWorkOrder.payload);  
            setOtMode('edit'); 
        }
        
        openWorkOrderForm();
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
            if (existingResolution.clientNotified) {
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
                        <hr className={styles.divider} />

                            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                        </div>

                        {currentMode === 'edit' && ( 
                            <div className={styles.buttonContainer}>
                                 <button onClick={handleResolutionClick} className={styles.resolutionButton}>
                                Resolución
                                </button>
                                <button onClick={handleWorkOrderClick} className={styles.printButton}>
                                    O.Trabajo
                                </button>
                                <button onClick={handleRepairOrderClick} className={styles.printButton}>
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
                                <button onClick={handleWorkOrderClick} className={styles.printButton}>
                                    O.Trabajo
                                </button>
                                <button onClick={handleRepairOrderClick} className={styles.printButton}>
                                    O.Reparacion
                                </button>
                                <button onClick={handleEdit} className={styles.editButton}>
                                   Modificar
                                </button>

                            </div>
                        )}
                        {repairOrderModalOpen && (
                            <RepairOrderForm  
                                burnedArtifactId={artifactId}
                                repairOrder={repairOrder}
                                mode={repairOrderMode}
                                onClose={closeRepairOrderForm}
                            />
                        )}
                        {workOrder && (
                            <OtForm 
                                sacId={sacId} 
                                onClose={closeWorkOrderForm} 
                                ot={workOrder} 
                                mode={otMode} 
                                origen="artefacto" 
                                artifact= {artifact.name}
                            />
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
