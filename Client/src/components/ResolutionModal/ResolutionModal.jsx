import { AiOutlineClose } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';  // Importa SweetAlert2
import { updateSAC, createResolution, updateResolution, fetchResolutionBySAC } from '../../redux/slices/sacsSlice';
import styles from './ResolutionModal.module.css';

const ResolutionModal = ({ sac, onClose }) => {
    const dispatch = useDispatch();
    const [mode, setMode] = useState('create');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [clientNotified, setClientNotified] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    const resolution = useSelector((state) => state.sacs.resolution);

    useEffect(() => {
        if (sac?.id) {
            const sacId = sac.id;
            setLoading(true);
            dispatch(fetchResolutionBySAC({ sacId })).finally(() => setLoading(false));
        }
    }, [dispatch, sac?.id]);

    useEffect(() => {
        if (resolution && Object.keys(resolution).length > 0) {
            if (sac.status !== 'Closed') {
                setMode('edit');
                setIsReadOnly(false);
            } else {
                setMode('view');
                setIsReadOnly(true);
            }
            setType(resolution.type || '');
            setDescription(resolution.description || '');
            setClientNotified(resolution.clientNotified || false);
        } else {
            setMode('create');
            setIsReadOnly(false);
        }
    }, [resolution, sac?.status]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'create') {
            dispatch(createResolution({ sacId: sac.id, resolutionData: { type, description, clientNotified } }))
                .then(() => {
                    Swal.fire('¡Resolución Creada!', 'La resolución ha sido creada exitosamente.', 'success');
                });
        } else if (mode === 'edit') {
            dispatch(updateResolution({ sacId: sac.id, resolutionId: resolution.id, resolutionData: { type, description, clientNotified } }))
                .then(() => {
                    Swal.fire('¡Resolución Actualizada!', 'Los cambios han sido guardados con éxito.', 'success');
                });
        }
    };

    const handleCloseSAC = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas cerrar este SAC?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                if (mode === 'create') {
                    // Crea una resolución si no existe
                    dispatch(createResolution({ sacId: sac.id, resolutionData: { type, description, clientNotified } }))
                        .then(() => {
                            dispatch(updateSAC({ id: sac.id, sacData: { status: 'Closed' } }));
                            Swal.fire('SAC Cerrado', 'El SAC ha sido cerrado exitosamente.', 'success');
                            onClose();
                        });
                } else {
                    // Solo cierra el SAC
                    dispatch(updateSAC({ id: sac.id, sacData: { status: 'Closed' } }));
                    Swal.fire('SAC Cerrado', 'El SAC ha sido cerrado exitosamente.', 'success');
                    onClose();
                }
            } else {
                // Si el usuario cancela, guarda o crea la resolución pero no cierra el SAC
                handleSubmit(e);
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.modalTitle}>
                    {mode === 'edit' ? `Editar Resolución` : mode === 'view' ? `Ver Resolución` : `Generar Resolución (SAC #${sac?.id})`}
                </h2>

                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        {/* Tipo de Resolución */}
                        <div className={styles.inlineGroup}>
                            <label className={styles.modalLabel}>Tipo de Resolución:</label>
                            <select
                                className={styles.modalSelect}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled={isReadOnly}
                            >
                                <option value="Personalizado">Personalizado</option>
                                <option value="option1">Opción 1</option>
                                <option value="option2">Opción 2</option>
                            </select>
                        </div>

                        {/* Redacción de la Resolución */}
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

                        {/* Cliente Notificado */}
                        <div className={styles.inlineGroup}>
                            <label className={styles.modalLabel}>Cliente Notificado:</label>
                            <input
                                type="checkbox"
                                checked={clientNotified}
                                onChange={(e) => setClientNotified(e.target.checked)}
                                disabled={isReadOnly}
                            />
                        </div>

                        {/* Botones en la parte inferior */}
                        <div className={styles.buttonContainer}>
                            {mode !== 'create' && (
                                <button className={styles.modalButton} type="button" onClick={handleCloseSAC}>
                                    Cerrar SAC
                                </button>
                            )}
                            {mode !== 'create' && (
                                <button className={styles.modalButton} type="button" onClick={() => console.log('Imprimir resolución')}>
                                    Imprimir
                                </button>
                            )}
                            <button className={styles.modalButton} type="submit">
                                {mode === 'create' ? 'Generar Resolución' : 'Grabar'}
                            </button>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResolutionModal;
