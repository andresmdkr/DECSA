import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineEdit, AiOutlineCheck,AiOutlineDelete } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { updateClientByAccountNumber } from '../../redux/slices/clientsSlice';
import {createSAC} from '../../redux/slices/sacsSlice';
import styles from './SacForm.module.css';
import ArtifactModal from '../ArtifactModal/ArtifactModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SacPDF from '../SacPDF/SacPDF';

const MySwal = withReactContent(Swal);

const EditableField = ({ label, value, isEditable, onEdit, onSave, type = 'text', maxLength = 250}) => {
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

const SacForm = ({ client, onClose }) => {
    const [isEditable, setIsEditable] = useState({});
    const [claimReason, setClaimReason] = useState('');
    const [area, setArea] = useState('operaciones');	
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [priority, setPriority] = useState('baja');
    const [artifacts, setArtifacts] = useState([]);
    const [showArtifactModal, setShowArtifactModal] = useState(false);
    const [artifactToEdit, setArtifactToEdit] = useState(null);
    const [areaModifiedManually, setAreaModifiedManually] = useState(false);
    const [claimantName, setClaimantName] = useState('');
    const [claimantRelationship, setClaimantRelationship] = useState('');
    const [claimantPhone, setClaimantPhone] = useState('');
    const [claimantType, setClaimantType] = useState('Titular');

    useEffect(() => {
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
        setEventDate(localDate.toISOString().split('T')[0]); 
        setStartTime(now.toTimeString().split(' ')[0].slice(0, 5));
    }, []);
    

    const dispatch = useDispatch();

    const showSuccessAlert = (sacId) => {
        MySwal.fire({
          title: '¡Solicitud de Atención al Cliente creada con éxito!',
          icon: 'success',
          confirmButtonText: 'Cerrar',
          showCancelButton: true,     
          cancelButtonText: 'Imprimir', 
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            console.log(sacId);
            SacPDF(sacId);
          }
            onClose();  
        });
      };

    const toggleEdit = (field) => {
        setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!claimReason) {
            Swal.fire({
                icon:"error",
                text:"Por favor, selecciona un motivo para el reclamo."});
            return;
        }

        try {
          const sacData = {
            clientId: client? client.accountNumber : null,
            claimReason,
            area,
            artifacts: claimReason === 'artefactos' ? artifacts : [], 
            description,
            eventDate: eventDate ? new Date(`${eventDate}T00:00:00`).toISOString() : null, 
            startTime: startTime ? `${startTime}:00` : null, 
            endTime: endTime ? `${endTime}:00` : null, 
            priority,
            ...(claimantType === 'Otro' && {
                claimantName, 
                claimantRelationship, 
                claimantPhone,
              }),
          };
          
          const response = await dispatch(createSAC(sacData)).unwrap();  
          console.log(response.id);
          showSuccessAlert(response.id);
        } catch (error) {
          console.error('Error al crear el SAC:', error);
          Swal.fire('Error de Servidor', 'Hubo un problema al crear la solicitud.', 'error');
        }
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

    const handleOpenModal = (artifact = null) => {
        setArtifactToEdit(artifact); 
        setShowArtifactModal(true);   
    };

    const handleCloseModal = () => {
        setShowArtifactModal(false);
        setArtifactToEdit(null);
    };

    const handleAddArtifact = (artifact) => {
        setArtifacts([...artifacts, artifact]);
        console.log(artifacts);
    };

    const handleEditArtifact = (updatedArtifact) => {
        const updatedArtifacts = artifacts.map((artifact) =>
            artifact === artifactToEdit ? updatedArtifact : artifact
        );
        setArtifacts(updatedArtifacts);
    };

    const handleRemoveArtifact = (index) => {
        const updatedArtifacts = artifacts.filter((_, i) => i !== index);
        setArtifacts(updatedArtifacts);
    };

    useEffect(() => {
        if (claimReason === 'artefactos' && !areaModifiedManually) {
            setArea('artefactos');
        }
    }, [claimReason, areaModifiedManually]);

    const handleAreaChange = (e) => {
        setArea(e.target.value);
        setAreaModifiedManually(true); 
    };


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.title}>Solicitud de Atención al Cliente (S.A.C)</h2>
                <hr />
                <div className={styles.modalContent2}>
                {/* Detalles del Cliente */}
                {client && (
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
                )}

                {/* Campos del Reclamante */}
                <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Reclamante</legend>

                {/* Select para elegir el tipo de reclamante */}
                <div className={styles.formGroup}>
                    <label className={styles.boldLabel2}>Reclamante:</label>
                    <select
                    value={claimantType}
                    onChange={(e) => setClaimantType(e.target.value)}
                    className={styles.select}
                    >
                    <option value="Titular">Titular</option>
                    <option value="Otro">Otro</option>
                    </select>
                </div>

                {/* Si el reclamante es 'Otro', se muestran los campos adicionales */}
                {claimantType === 'Otro' && (
                    <>
                    <div className={styles.formGroup4}>
                        <label className={styles.boldLabel2}>Nombre y Apellido del Reclamante:</label>
                        <input
                        type="text"
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup4}>
                        <label className={styles.boldLabel2}>Relación con el Titular:</label>
                        <input
                        type="text"
                        value={claimantRelationship}
                        onChange={(e) => setClaimantRelationship(e.target.value)}
                        className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup4}>
                        <label className={styles.boldLabel2}>Teléfono:</label>
                        <input
                        type="text"
                        value={claimantPhone}
                        onChange={(e) => setClaimantPhone(e.target.value)}
                        className={styles.inputField}
                        />
                    </div>
                    </>
                )}
                </fieldset>

                {/* Motivo del Reclamo */}
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Motivo del Reclamo</legend>
                    <div className={styles.formGroup}>
                        <label className={styles.boldLabel}>Motivo:</label>
                        <select
                            value={claimReason}
                            onChange={(e) => setClaimReason(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="facturacion">Error de Facturación</option>
                            <option value="recepcion" >Inconveniente en Recepción de Factura</option>
                            <option value="artefactos">Rotura de Artefacto/s</option>
                        </select>
                    </div>

                    {/* Descripción */}
                    <div className={styles.section2}>
                        <div className={styles.formGroup2}>
                            <label className={styles.boldLabel}>Detalles de lo acontecido:</label>
                            <textarea 
                            className={styles.textarea} 
                            placeholder="Describe el reclamo aquí..."
                            value = {description}
                            onChange = {(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Fecha y Hora */}
                        <div className={styles.formGroupRight}>
                            <div className={styles.subGroup}>
                                <label className={styles.boldLabel}>Fecha del evento:</label>
                                <input  
                                type="date" 
                                className={styles.dateInput} 
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                />
                            </div>
                            <div className={styles.subGroup}>
                                <label className={styles.boldLabel}>Hora de inicio:</label>
                                <input 
                                type="time" 
                                className={styles.timeInput} 
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}></input>
                            </div>
                            <div className={styles.subGroup}>
                                <label className={styles.boldLabel}>Hora de fin:</label>
                                <input 
                                type="time" 
                                className={styles.timeInput}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}></input> 
                            </div>
                        </div>
                       
                    </div>
                    <hr className={styles.sectionSeparator} />
                        <div className={styles.formGroup3}>
                        <label className={styles.boldLabel}>Prioridad:</label>
                        <select 
                        className={styles.select}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>

                        <label className={styles.boldLabel}>Área Encargada:</label>
                        <select 
                        className={styles.select}
                        value={area}
                        onChange={handleAreaChange}>
                            <option value="operaciones">Operaciones</option>
                            <option value="artefactos">Artefactos Quemados</option>
                        </select>
                        </div>
                </fieldset>

                {/* Artefactos Quemados */}
                {claimReason === 'artefactos' && (
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Artefactos Quemados</legend>
                        <table className={styles.artifactTable}>
                        <thead>
                                <tr>
                                    <th className={styles.colArtifact}>Artefacto</th>
                                    <th className={styles.colBrand}>Marca/Modelo/Número de Serie</th>
                                    <th className={styles.colDocumentation}>Documentación Adicional</th>
                                    <th className={styles.colActions}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artifacts.map((artifact, index) => (
                                    <tr key={index}>
                                        <td className={styles.colArtifact}>{artifact.name}</td>
                                        <td className={styles.colBrand}>{`${artifact.brand} ${artifact.model} ${artifact.serialNumber}`}</td>
                                        <td className={styles.colDocumentation}>{artifact.documentation}</td>
                                        <td className={`${styles.colActions} ${styles.actions}`}> 
                                            <button className={styles.editButton2} onClick={() => handleOpenModal(artifact)}>
                                                <AiOutlineEdit />
                                            </button>
                                            <button className={styles.removeButton} onClick={() => handleRemoveArtifact(index)}>
                                                <AiOutlineDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className={styles.addArtifactButton} onClick={() => handleOpenModal()}>
                            Agregar Artefacto
                        </button>
                    </fieldset>
                )}

                {showArtifactModal && (
                    <ArtifactModal
                        onClose={handleCloseModal}
                        onAdd={handleAddArtifact}
                        onEdit={handleEditArtifact}  
                        artifactToEdit={artifactToEdit}  
                    />
                )}

                <hr />
                <div className={styles.formActions}>
                    <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                    <button className={styles.submitButton} onClick={handleSubmit}>
                        {area === 'artefactos' ? 'Enviar a Artefactos Quemados' : 'Enviar a Operaciones'}
                    </button>
                </div>
                </div>  
            </div>
        </div>
    );
};

export default SacForm;
