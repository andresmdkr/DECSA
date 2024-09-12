import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientByAccountNumber, updateClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { updateSAC } from '../../redux/slices/sacsSlice';
import Swal from 'sweetalert2';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import styles from './Sac.module.css';
import OacModal from '../OacModal/OacModal';

const EditableField = ({ label, value, isEditable, onEdit, onSave, type = 'text', maxLength = 250 }) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef(null);
    const editingRef = useRef(false);

    useEffect(() => {
        if (isEditable && inputRef.current) {
            inputRef.current.focus();
            editingRef.current = true;
        }
    }, [isEditable]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isEditable && inputRef.current && !inputRef.current.contains(e.target)) {
                onSave(localValue);
                editingRef.current = false;
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditable, localValue, onSave]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSave(localValue);
        }
    };

  
        

    return (
        <div className={styles.fieldGroup}>
            <label className={styles.boldLabel}>{label}</label>
            <div className={styles.inputGroup}>
                {isEditable ? (
                    <>
                        <input
                            type={type}
                            value={localValue}
                            onChange={(e) => setLocalValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            ref={inputRef}
                            className={styles.inputEditable}
                            maxLength={maxLength}
                        />
                        <button className={styles.saveButton} onClick={() => onSave(localValue)}>
                            <AiOutlineCheck />
                        </button>
                    </>
                ) : (
                    <>
                        <input type={type} value={value} readOnly className={styles.inputReadonly} />
                        <button className={styles.editButton} onClick={onEdit}>
                            <AiOutlineEdit />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const Sac = ({ sac, onClose}) => {
    const dispatch = useDispatch();
    const client = useSelector((state) => state.clients.client);
    const [isOacModalOpen, setIsOacModalOpen] = useState(false);
    const [isEditable, setIsEditable] = useState({});


    useEffect(() => {
        if (sac.clientId) {
            dispatch(fetchClientByAccountNumber(sac.clientId));
        }
    
    }, [dispatch, sac.clientId]);

    

    const toggleEdit = (field) => {
        setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async (field, newValue) => {
        try {
            await dispatch(
                updateClientByAccountNumber({
                    accountNumber: client.accountNumber,
                    data: { [field]: newValue },
                })
            );
            toggleEdit(field);
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'S/N';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleMissingValue = (value) => {
        return value ? value : 'S/N';
    };

    const handleDerivar = async () => {
        const result = await Swal.fire({
            title: `¿Seguro que quieres derivar la S.A.C #${sac.id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, derivar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            const { value: area } = await Swal.fire({
                title: 'Elija donde derivarlo:',
                input: 'select',
                inputOptions: {
                    artefactos: 'Artefactos',
                    operaciones: 'Operaciones',
                },
                inputPlaceholder: 'Selecciona un área',
                showCancelButton: true,
                confirmButtonText: 'Derivar',
                cancelButtonText: 'Cancelar',
            });

            if (area) {
                const sacData = { ...sac, area }; 

                try {
                    await dispatch(updateSAC({ id: sac.id, sacData })); 

                    Swal.fire({
                        title: `S.A.C #${sac.id} derivada correctamente`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    onClose();
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo derivar la S.A.C',
                        icon: 'error',
                    });
                }
            }
        }
    };

 

    const handleOpenOacModal = () => {
        setIsOacModalOpen(true);
    };

    const handleCloseOacModal = () => {
        setIsOacModalOpen(false);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
            <h2 className={styles.title}>Reclamo S.A.C #{sac.id}</h2>
            <hr />
            <div className={styles.modalContent2}>
            

            {/* Detalles del Reclamo */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Detalles del Reclamo</legend>
                <div className={styles.field}>
                    <label className={styles.boldLabel}>Motivo del Reclamo:</label>
                    <label value={sac.claimReason}> {sac.claimReason} </label>
                </div>
                <div className={styles.field}>
                    <label className={styles.boldLabel}>Descripción de lo Acontecido:</label>
                    <label value={sac.description}> {sac.description} </label>
                </div>
                <div className={styles.fieldDate}>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Fecha del Evento:</label>
                        <label>{formatDate(sac.eventDate)}</label>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Hora de Inicio:</label>
                        <label>{handleMissingValue(sac.startTime)}</label>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Hora de Fin:</label>
                        <label>{handleMissingValue(sac.endTime)}</label>
                    </div>
                </div>
            </fieldset>

                  
                
            {/* Artefactos (si aplica) */}
            {sac.artifacts?.length > 0 && (
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Artefactos Afectados</legend>
                    <table className={styles.artifactTable}>
                            <thead>
                                <tr>
                                    <th className={styles.colArtifact}>Artefacto</th>
                                    <th className={styles.colBrand}>Marca/Modelo/Número de Serie</th>
                                    <th className={styles.colDocumentation}>Documentación Adicional</th>
                                </tr>
                            </thead>
                        <tbody>
                            {sac.artifacts.map((artifact) => (
                                <tr key={artifact.id}>
                                   <td className={styles.colArtifact}>{artifact.name}</td>
                                   <td className={styles.colBrand}>{`${artifact.brand} ${artifact.model} ${artifact.serialNumber}`}</td>
                                   <td className={styles.colDocumentation}>{artifact.documentation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </fieldset>

             
                
            )}
            {/* Detalles del Cliente */}
            {client ? (
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Detalles del Cliente</legend>
                    <div className={styles.section}>
                        <EditableField
                            label="Número de Cuenta:"
                            value={client.accountNumber}
                            isEditable={isEditable.accountNumber}
                            onEdit={() => toggleEdit('accountNumber')}
                            onSave={(newValue) => handleSave('accountNumber', newValue)}
                        />
                        <EditableField
                            label="Nombre del Titular:"
                            value={client.holderName}
                            isEditable={isEditable.holderName}
                            onEdit={() => toggleEdit('holderName')}
                            onSave={(newValue) => handleSave('holderName', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Dirección:"
                            value={client.address}
                            isEditable={isEditable.address}
                            onEdit={() => toggleEdit('address')}
                            onSave={(newValue) => handleSave('address', newValue)}
                        />
                        <EditableField
                            label="Info. Adicional Dirección:"
                            value={client.extraAddressInfo}
                            isEditable={isEditable.extraAddressInfo}
                            onEdit={() => toggleEdit('extraAddressInfo')}
                            onSave={(newValue) => handleSave('extraAddressInfo', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Dirección Postal:"
                            value={client.postalAddress}
                            isEditable={isEditable.postalAddress}
                            onEdit={() => toggleEdit('postalAddress')}
                            onSave={(newValue) => handleSave('postalAddress', newValue)}
                        />
                        <EditableField
                            label="Info. Adicional Postal:"
                            value={client.extraPostalAddressInfo}
                            isEditable={isEditable.extraPostalAddressInfo}
                            onEdit={() => toggleEdit('extraPostalAddressInfo')}
                            onSave={(newValue) => handleSave('extraPostalAddressInfo', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Teléfono:"
                            value={client.phone || ''}
                            isEditable={isEditable.phone}
                            onEdit={() => toggleEdit('phone')}
                            onSave={(newValue) => handleSave('phone', newValue)}
                        />
                        <EditableField
                            label="Teléfono Auxiliar:"
                            value={client.auxPhone || ''}
                            isEditable={isEditable.auxPhone}
                            onEdit={() => toggleEdit('auxPhone')}
                            onSave={(newValue) => handleSave('auxPhone', newValue)}
                        />
                    </div>
                </fieldset>
            ) : (
                <p>Cargando detalles del cliente...</p>
            )}
       
                </div>
                <div className={styles.buttonsContainer}>
                    <button className={styles.actionButton} onClick={handleDerivar}>
                        Derivar
                    </button>

                    <button className={styles.actionButton} onClick={handleOpenOacModal}>
                        O.A.C
                    </button>
                    <button className={styles.actionButton} onClick={() => console.log('Orden de Trabajo')}>
                        O.Trabajo
                    </button>
                    <button className={styles.actionButton} onClick={() => console.log('Orden de Inspección')}>
                        O.Inspeccion
                    </button>
                </div>
            </div>
            {isOacModalOpen && (
                <OacModal sac={sac} onClose={handleCloseOacModal} />
            )}
        </div>
    );
};

export default Sac;
