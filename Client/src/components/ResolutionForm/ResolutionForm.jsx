import { AiOutlineClose } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArtifact } from '../../redux/slices/artifactsSlice';
import Swal from 'sweetalert2'; 
import { createResolution, updateResolution, fetchResolutions } from '../../redux/slices/resolutionSlice.js';
import styles from './ResolutionForm.module.css';

const ResolutionForm = ({ sacId, burnedArtifactId, resolution, mode, onClose }) => {
    const dispatch = useDispatch();
    const [type, setType] = useState('');
    const [currentMode, setCurrentMode] = useState(mode);
    const [description, setDescription] = useState('');
    const [clientNotified, setClientNotified] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(currentMode === 'view');
    const [resolutionId, setResolutionId] = useState(null);
    

    const artifact = useSelector(state => state.artifacts.artifact);

    useEffect(() => {
        if (!burnedArtifactId) {
            dispatch(fetchResolutions({ sacId, burnedArtifactId }));
        }
        if (burnedArtifactId || resolution?.burnedArtifactId) {
            const artifactId = burnedArtifactId || resolution?.burnedArtifactId;
            dispatch(fetchArtifact(artifactId)); 
        }
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
                .then(() => {
                    Swal.fire({
                        title: '¡Resolución Creada!',
                        text: 'La resolución ha sido creada exitosamente.',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Imprimir',
                        cancelButtonText: 'Cerrar',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            console.log('Imprimir resolución');
                            onClose();  
                        } else {
                            onClose();
                        }
                    });
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
                            console.log('Imprimir resolución');
                        } else {
                            onClose();
                        }
                    });
                });
        }
    };

    const renderTypeOptions = () => {
        if (burnedArtifactId || resolution?.burnedArtifactId) {
            return (
                <>
                    <option value="Artefacto/ProblemaElectrico">Artefacto afectado por problema eléctrico</option>
                    <option value="FCViento">Fallo/Corte por viento</option>
                    <option value="InconvenienteAjenoAlServicioElectrico">Inconveniente ajeno al servicio eléctrico</option>
                    <option value="InconvenienteInstalacionesUsuario">Inconveniente en instalaciones del usuario</option>
                    <option value="ReconocimientoIndemnizaciónConRecibo">Reconocimiento de indemnización con recibo</option>
                    <option value="ReconocimientoRoturaReparacion">Reconocimiento de rotura y reparación</option>
                    <option value="ReparaciónPreviaReclamo">Reparación previa al reclamo</option>
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
                                onChange={(e) => setType(e.target.value)}
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
                                <button className={styles.modalButton} type="button" onClick={() => console.log('Imprimir resolución')}>
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
