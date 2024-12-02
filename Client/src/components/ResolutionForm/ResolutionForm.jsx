import { AiOutlineClose } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtifact } from '../../redux/slices/artifactsSlice';
import Swal from 'sweetalert2'; 
import { createResolution, updateResolution, fetchResolutions } from '../../redux/slices/resolutionSlice.js';
import styles from './ResolutionForm.module.css';
import ResolutionPDF from '../ResolutionPDF/ResolutionPDF.js';

const ResolutionForm = ({ sacId, burnedArtifactId, resolution, mode, onClose }) => {
    const dispatch = useDispatch();
    const [type, setType] = useState('');
    const [currentMode, setCurrentMode] = useState(mode);
    const [description, setDescription] = useState('');
    const [clientNotified, setClientNotified] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(currentMode === 'view');
    const [resolutionId, setResolutionId] = useState(null);
    const [artifactData, setArtifactData] = useState(null);
    
    
    const artifact = useSelector(state => state.artifacts.artifact);

    const formatEventDate = (date) => {
        if (!date) return 'N/A';
        const eventDate = new Date(date);
        return eventDate.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    
    const formatStartTime = (time) => {
        if (!time) return 'N/A';
        const [hours, minutes, seconds] = time.split(':');
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };
    


    const defaultTexts = {
        
//////////////////////////       
InconvenienteAjenoAlServicioElectrico: `Me dirijo a Ud. en relación al reclamo de la referencia, el cual se corresponde con el artefacto "${artifactData?.name} / ${artifactData?.brand}" reclamado por Usted.

Mediante Orden de Atencion al Cliente N°  y  Orden de Trabajo N° ${artifactData?.workOrder?.id ?? 'N/A'} se inició el procedimiento de evaluación del reclamo según lo indicado en la Resolucion 16/97 del E.P.R.E; de lo observado en ambas órdenes se constató que: no existe rotura de su artefacto. Por lo que no corresponde hacer lugar a su reclamo N° ${sacId} del artefacto antes mencionado.

La presente nota, tiene caracter de resolución definitiva del reclamo mencionado en el primer párrafo.

Por ello mediante la Orden de Reparación N° ${artifactData?.repairOrder?.id ?? 'N/A'} se dispuso la reparación de su artefacto.

La presente nota, tiene caracter de resolución definitiva a su reclamo,la cual firma en conformidad, entregandose el artefacto reparado donde constata el normal funcionamiento.`,
        
//////////////////////////   
FCFuerzaMayor: `Me dirijo a Ud. en relación al reclamo de la referencia, el cual se corresponde con la rotura del artefacto "${artifactData?.name} / ${artifactData?.brand}" que habría ocurrido el día ${formatEventDate(artifactData?.SAC.eventDate)} a las ${formatStartTime(artifactData?.SAC.startTime)} aproximadamente.

De los hechos ocurridos en fecha indicada como momento del daño, DECSA informa que, si bien existieron eventos en la red, estos se debieron a una situación climática la cual es considerada casos de fuerza mayor. En estos casos, y en concordancia con lo estipulado en el Contrato de Concesión vigente, le informamos que la Distribuidora no tiene responsabilidad en los eventos que hubiesen ocasionado alteraciones y/o roturas en su artefacto.

Por ello no corresponde reconocer los costos asociados a la reparación y/o reposición del artefacto reclamado.

La presente nota, tiene carácter de resolución definitiva del reclamo mencionado en el primer párrafo.`,
        
//////////////////////////   
ReconocimientoIndemnizaciónConRecibo: `Me dirijo a Ud. en relación al reclamo de la referencia, el cual se corresponde con la rotura del artefacto "${artifactData?.name} / ${artifactData?.brand}" que habría ocurrido el día ${formatEventDate(artifactData?.SAC.eventDate)} a las ${formatStartTime(artifactData?.SAC.startTime)} aproximadamente.

En tal sentido se inició el procedimiento de evaluación de su reclamo según lo indicado en la Resolución 16/97 del E.P.R.E; donde constató que el artefacto fue reparado por su cuenta, presentando los gastos mediante factura C00002-00000652.

Por ello, DECSA entrega el reintegro del gasto incurrido la suma monetaria de $${artifactData?.repairOrder?.budget ?? 'N/A'}.`,
        
//////////////////////////   
ReconocimientoReparacion: `Me dirijo a Ud. en relación al reclamo de la referencia, el cual se corresponde con el artefacto "${artifactData?.name} / ${artifactData?.brand}" reclamado por Usted.

En tal sentido se inició el proceso de evaluación del reclamo según lo indicado en Resolucion 16/97 del E.P.R.E; donde se constató que se debe reemplazar placa fuente.

Por ello mediante la Orden de Reparación N° ${artifactData?.repairOrder?.id ?? 'N/A'} se dispuso la reparación de su artefacto.

La presente nota, tiene caracter de resolución definitiva a su reclamo,la cual firma en conformidad, entregandose el artefacto reparado donde constata el normal funcionamiento.`,
        
//////////////////////////   
Personalizado: "" 
    };
    

    useEffect(() => {
        const fetchResolutionAndArtifact = async () => {
            if (!burnedArtifactId) {
                await dispatch(fetchResolutions({ sacId, burnedArtifactId }));
            }
    
            const artifactId = burnedArtifactId || resolution?.burnedArtifactId;
            if (artifactId) {
                const artifactResponse = await dispatch(fetchArtifact(artifactId));
                const artifactData = artifactResponse?.payload;
                
                if (artifactData) {
                    setArtifactData(artifactData);
                    console.log(artifactData)
                } else {
                    console.error('Artefacto no encontrado');
                }
            }
        };
    
        fetchResolutionAndArtifact();
    }, [burnedArtifactId, sacId, dispatch]);
    

    useEffect(() => {
        if (currentMode !== 'create' && resolution) {
            setType(resolution.type || '');
            setDescription(resolution.description || '');
            setClientNotified(resolution.clientNotified || false);
            setResolutionId(resolution.id);
        }
    }, [currentMode, resolution]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!type) {
            Swal.fire({
                icon: 'error',
                title: 'Tipo de Resolución requerido',
                text: 'Por favor, selecciona un tipo de resolución antes de continuar.',
            });
            return; 
        }
    
        if (currentMode === 'create') {
            dispatch(createResolution({ sacId, resolutionData: { type, description, clientNotified, burnedArtifactId } }))
                .then((response) => {
                    const createdResolutionId = response.payload?.id; 
    
                    Swal.fire({
                        title: '¡Resolución Creada!',
                        text: 'La resolución ha sido creada exitosamente.',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Imprimir',
                        cancelButtonText: 'Cerrar',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const artifactId = burnedArtifactId || response.payload?.burnedArtifactId;
                            ResolutionPDF(sacId, createdResolutionId, artifactId); 
                        }
                        onClose();
                    });
                })
                .catch((error) => {
                    console.error("Error al crear la resolución:", error);
                });
        } else if (currentMode === 'edit') {
            dispatch(updateResolution({ sacId, resolutionId: resolution.id, resolutionData: { type, description, clientNotified } }))
                .then(() => {
                    Swal.fire({
                        title: '¡Resolución Actualizada!',
                        text: 'Los cambios han sido guardados con éxito.',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Imprimir',
                        cancelButtonText: 'Cerrar',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const artifactId = burnedArtifactId || resolution?.burnedArtifactId;
                            ResolutionPDF(sacId, resolution.id, artifactId);
                        }
                        onClose()
                    });
                })
                .catch((error) => {
                    console.error("Error al actualizar la resolución:", error);
                });
        }
    };

    const renderTypeOptions = () => {
        if (burnedArtifactId || resolution?.burnedArtifactId) {
            return (
                <>
                    <option value="ReconocimientoReparacion">Reconocimiento de Reparación</option>
                    <option value="InconvenienteAjenoAlServicioElectrico">Inconveniente ajeno al servicio eléctrico</option>
                    <option value="ReconocimientoIndemnizaciónConRecibo">Reconocimiento de indemnización con recibo</option>
                    <option value="FCFuerzaMayor">Caso fuerza mayor</option>
                </>
            );
        } else {
            return (
                <>
                    <option value="Personalizado">Personalizado</option>
                </>
            );
        }
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setType(selectedType);
        setDescription(defaultTexts[selectedType]); 
    };

    const handlePrint = async () => {
        if (currentMode === 'edit') {
            try {
                await dispatch(updateResolution({ 
                    sacId, 
                    resolutionId: resolution.id, 
                    resolutionData: { type, description, clientNotified } 
                }));
                const artifactId = burnedArtifactId || resolution?.burnedArtifactId;
                ResolutionPDF(sacId, resolution.id, artifactId);
            } catch (error) {
                console.error("Error al actualizar la resolución antes de imprimir:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al actualizar la resolución antes de imprimir.',
                });
            }
        } else {
            const artifactId = burnedArtifactId || resolution?.burnedArtifactId;
            
            ResolutionPDF(sacId, resolution.id, artifactId);
        }
    };
    
    

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.modalTitle}>
                    {currentMode === 'edit' ? `Editar Resolución (#${resolutionId})` : currentMode === 'view' ? `Ver Resolución (#${resolutionId})` : `Generar Resolución (SAC #${sacId})`}
                </h2>

                {(burnedArtifactId || resolution?.burnedArtifactId) && (
                    <h3 className={styles.miniTitle}>
                        {`Reclamo Artefacto (${artifact?.name})`}
                    </h3>
                )}

                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inlineGroup}>
                            <label className={styles.modalLabel}>Tipo de Resolución:</label>
                            <select
                                className={styles.modalSelect}
                                value={type}
                                onChange={handleTypeChange}
                                disabled={isReadOnly}
                            >
                                <option value="" disabled>Selecciona un tipo</option> 
                                {renderTypeOptions()}
                            </select>
                        </div>

                        <div className={styles.textareaGroup}>
                            <label className={styles.modalLabel}>Redactar Resolución:</label>
                            <textarea
                                className={styles.modalTextarea}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe la resolución aquí..."
                                maxLength={1000}
                                readOnly={isReadOnly}
                            />
                        </div>

                        <hr className={styles.separator} />

                        <div className={styles.inlineGroup}>
                            <label className={styles.checkboxGroup}>
                                Cliente Notificado:
                                <input
                                    type="checkbox"
                                    checked={clientNotified}
                                    onChange={(e) => setClientNotified(e.target.checked)}
                                    disabled={isReadOnly}
                                />
                            </label>
                        </div>

                        <div className={styles.buttonContainer}>
                           
                            {currentMode !== 'create' && (
                                <button className={styles.modalButton} type="button" onClick={handlePrint}>
                                    Imprimir
                                </button>
                            )}
                             {currentMode === 'view' && (
                                <button className={styles.modalButton} type="button" onClick={() => {setIsReadOnly(false), setCurrentMode("edit")}}>
                                    Modificar
                                </button>
                            )}
                            {currentMode !== 'view' && (
                                <button className={styles.modalButton} type="submit" disabled={isReadOnly}>
                                    {currentMode === 'create' ? 'Crear' : 'Grabar'} Resolución
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResolutionForm;
