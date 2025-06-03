import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientByAccountNumber, updateClientByAccountNumber } from '../../redux/slices/clientsSlice';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import { updateSAC } from '../../redux/slices/sacsSlice';
import { fetchOACs } from '../../redux/slices/oacSlice.js';
import {updateArtifact} from '../../redux/slices/artifactsSlice.js'
import { createInternalWorkOrder } from '../../redux/slices/otiSlice.js';
import Swal from 'sweetalert2';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import styles from './Sac.module.css';
import OacModal from '../OacModal/OacModal';
import OacForm from '../OacForm/OacForm.jsx';
import OtModal from '../OtModal/OtModal';
import OtiForm from '../OtiForm/OtiForm.jsx';
import ResolutionModal from '../ResolutionModal/ResolutionModal.jsx';
import Artifact from '../Artifact/Artifact';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { FaCopy, FaWhatsapp } from 'react-icons/fa';
'AIzaSyDsOGP7vyWVBiZUpyE1uiHg43oNGFgLCPo'
const MapComponent = ({ latitude, longitude,client,sac}) => {
  const [mapCenter] = useState({ lat: latitude, lng: longitude });
  const [isInteractive, setIsInteractive] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDsOGP7vyWVBiZUpyE1uiHg43oNGFgLCPo',
  });

  if (loadError || !navigator.onLine)
    return (
      <div className={styles.mapError}>
        <p>Error al cargar el mapa: no se puede establecer conexión a internet.</p>
      </div>
    );

  if (!isLoaded)
    return <div className={styles.mapLoading}>Cargando mapa...</div>;

  const mapOptions = {
    streetViewControl: false,
    gestureHandling: isInteractive ? "auto" : "none",
  };

  const address = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address).then(() => {
      Swal.fire({
        icon: "success",
        title: "¡Dirección copiada!",
        text: "La dirección ha sido copiada al portapapeles.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    });
  };

  const handleShareWhatsApp = () => {
    const {
      accountNumber,
      holderName,
      address,
      extraAddressInfo,
      phone,
      supply,
      substation,
      device,
      wsg84Lati,
      wsg84Long,
    } = client;
  
    const direccionCompleta = extraAddressInfo
      ? `${address} ${extraAddressInfo}`
      : address;
  
    const ubicacionLink = `https://maps.google.com/?q=${wsg84Lati},${wsg84Long}&z=18`;
  
    const formatNumber = (number) =>
      number.replace(/(\d)/g, '$1\u200B'); 
  
    const sacInfo = sac
      ? [
          `*Numero de Reclamo:* ${sac.id}`,
          `*Motivo del reclamo:* ${sac.claimReason}`,
          sac.artifacts?.length
            ? `*Artefactos asociados:* \n${sac.artifacts
                .map((artifact, index) => `${index + 1}: ${artifact.name} / ${artifact.brand}`)
                .join('\n')}`
            : '',
        ].filter(Boolean).join('\n')
      : '';
  
    const mensaje = [
      `*Número de Cuenta:* ${formatNumber(accountNumber)}`,
      `*Nombre:* ${holderName}`,
      `*Dirección:* ${direccionCompleta}`,
      phone ? `*Teléfono:* ${phone}` : '',
      `*Número de Suministro:* ${formatNumber(supply)}`,
      `*SETA:* ${formatNumber(substation)}`,
      `*Medidor:* ${formatNumber(device)}`,
      ` `,
      sacInfo,
      ` `,
      `*Ubicación:*`,
      ubicacionLink,
    ]
      .filter(Boolean)
      .join('\n');
  
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappURL, '_blank');
  };
  
  
  
  

  return (
    <div>
      <div
        className={styles.mapWrapper}
        onClick={() => setIsInteractive(true)}
        onMouseLeave={() => setIsInteractive(false)}
      >
        <GoogleMap
          center={mapCenter}
          zoom={18}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          <Marker position={{ lat: latitude, lng: longitude }} />
        </GoogleMap>
        {!isInteractive && (
          <div className={styles.mapOverlay}>
            Haz clic para interactuar con el mapa
          </div>
        )}
      </div>

      <div className={styles.mapButtons}>
        <button className={styles.mapButton} onClick={handleCopyAddress}>
          <FaCopy className={styles.mapButtonIcon} /> Copiar Dirección
        </button>
        <button className={styles.mapButton2} onClick={handleShareWhatsApp}>
          <FaWhatsapp className={styles.mapButtonIcon} /> Compartir por WhatsApp
        </button>
      </div>
    </div>
  );
};


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
        setLocalValue(value);
    }, [value]);

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
    const oacs = useSelector((state) => state.oacs.oacs || []);
    const [isOacModalOpen, setIsOacModalOpen] = useState(false);
    const [isOacFormOpen, setIsOacFormOpen] = useState(false);
    const [isOtModalOpen, setIsOtModalOpen] = useState(false);
    const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
    const [isEditable, setIsEditable] = useState({});
    const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [artifacts, setArtifacts] = useState(sac.artifacts);
    const [status, setStatus] = useState(sac.status);
    const [client2, setClient2] = useState(null);
    const [wsg84Lati, setWsg84Lati] = useState(null);
    const [wsg84Long, setWsg84Long] = useState(null);
    const [showOtiModal, setShowOtiModal] = useState(false);
    const [otiData, setOtiData] = useState(null);
    
    useEffect(() => {
        if (sac.clientId) {
          dispatch(fetchClientByAccountNumber(sac.clientId))
            .unwrap()  
            .then((data) => {
              setClient2(data); 
            })
            .catch((error) => {
              console.error("Error al obtener cliente:", error);
            });
        }
      }, [dispatch, sac.clientId]);
      
      console.log(sac)

    // Asignar valores después de recibir el cliente
    useEffect(() => {
      if (client2) {
        setWsg84Lati(client2.wsg84Lati || null);
        setWsg84Long(client2.wsg84Long || null);
      }
    }, [client2]);
    
    useEffect(() => {
        if (sac) {
          dispatch(fetchOACs(sac.id));
        }
      }, [dispatch, sac]);
 

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
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar UTC
        
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    

    const handleMissingValue = (value) => {
        return value ? value : 'S/N';
    };


    const handleCloseSAC = async () => {
        const result = await Swal.fire({
            title: `¿Estás seguro de cerrar la S.A.C #${sac.id}?`,
            text: "El estado se cambiará a 'Cerrado' y no podrás modificarlo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
        });
    
        if (result.isConfirmed) {
            try {

                const user = JSON.parse(localStorage.getItem('user'));
                const now = new Date();
                const argNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    
                const formattedDate = argNow.toISOString().split('T')[0]; 
                const formattedTime = argNow.toTimeString().split(' ')[0]; 
    
                const updatedData = {
                    ...sac,
                    status: 'Closed',
                    closeDate: formattedDate,
                    closeTime: formattedTime,
                    closedBy: `${user.name} ${user.lastName}`,
                };
    
                await dispatch(updateSAC({ id: sac.id, sacData: updatedData }));
                setStatus('Closed');
                Swal.fire({
                    title: '¡S.A.C Cerrada!',
                    text: `El estado de la S.A.C #${sac.id} fue actualizado a 'Cerrado'.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
    
                onClose();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cerrar la S.A.C.',
                    icon: 'error',
                });
            }
        }
    };


    const handleReopenSAC = async () => {
        const result = await Swal.fire({
            title: `¿Estás seguro de reabrir la S.A.C #${sac.id}?`,
            text: "El estado se cambiará a 'Abierto' y podrás continuar editándola.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reabrir',
            cancelButtonText: 'Cancelar',
        });
    
        if (result.isConfirmed) {
            try {
                setStatus('Open')              
                Swal.fire({
                    title: '¡S.A.C Reabierta!',
                    text: `El estado de la S.A.C #${sac.id} fue actualizado a 'Abierto'.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
    
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo reabrir la S.A.C.',
                    icon: 'error',
                });
            }
        }
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
      title: 'Elija dónde derivarlo:',
      input: 'select',
      inputOptions: {
        artefactos: 'Artefactos',
        operaciones: 'Operaciones',
        operaciones_oti: 'Operaciones (para O.T.I)',
        comercial: 'Comercial',
      },
      inputPlaceholder: 'Selecciona un área',
      showCancelButton: true,
      confirmButtonText: 'Derivar',
      cancelButtonText: 'Cancelar',
    });

    if (!area) return;

    // Derivación para O.T.I
    if (area === 'operaciones_oti') {
      try {
        const hasOTI = sac.internalWorkOrders && sac.internalWorkOrders.length > 0;

        // Actualizamos siempre la SAC al área op_adm
        const sacData = { ...sac, area: 'op_adm', status: 'Pending' };
        await dispatch(updateSAC({ id: sac.id, sacData }));

        // Si ya tiene OTI, no hacemos nada más
        if (hasOTI) {
          Swal.fire({
            title: `S.A.C #${sac.id} derivada a Operaciones (ya tenía OTI)`,
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
          });
          onClose();
          return;
        }

        // Crear nueva OTI si no existe
        const task = sac.claimReason === 'Rotura de Artefactos'
          ? 'Inspeccionar Puesto de Medición, Acometida, cableado desde medidor hacia Seta. Informar estado.'
          : 'Derivado';

        const internalWorkOrderData = {
          sacId: sac.id,
          task,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          location: `${client2.address} ${client2.extraAddressInfo}` || '',
          observations:  '',
          assignedTo: '',
          completionDate: null,
          files: [],
          isDerived: true,
        };

        await dispatch(createInternalWorkOrder({ internalWorkOrderData }));

        Swal.fire({
          title: `OTI creada y S.A.C #${sac.id} derivada correctamente`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        onClose();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear la OTI o derivar la S.A.C',
          icon: 'error',
        });
      }

      return;
    }

    // Derivación estándar (no OTI)
    try {
      const sacData = { ...sac, area, status: 'Pending' };
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
};





    const handleOpenOacModal = () => {
        setIsOacModalOpen(true);
    };

    const handleCloseOacModal = () => {
        setIsOacModalOpen(false);
    };

    const handleOpenOacForm = () => setIsOacFormOpen(true);
    const handleCloseOacForm = () => setIsOacFormOpen(false);

    const handleOpenOtModal = () => {
        setIsOtModalOpen(true);
    };

    const handleOacCreated = async (sacId) => {
        const sacData = { status: 'Open' }; 
        try {
            await dispatch(updateSAC({ id: sacId, sacData }));
            setIsOacFormOpen(false); 
        } catch (error) {
            console.error('Error al actualizar el SAC:', error);
        }
    };  

    const handleCloseOtModal = () => {
        setIsOtModalOpen(false);
    };

      const handleOpenResolutionModal = () => {
         setIsResolutionModalOpen(true);
    };
   

    const handleCloseResolutionModal = () => {
        setIsResolutionModalOpen(false);
    };

    


    const handleOpenArtifact = (artifact) => {
        if (artifact.status === "Pending") {   
            handleArtifactUpdate(artifact.id, "In Progress");
    
            dispatch(updateArtifact({
                artifactId: artifact.id,
                artifactData: { status: "In Progress" }
            }));
        }
    
        setSelectedArtifact(artifact);
        setIsArtifactModalOpen(true);
    };
    

    const handleCloseArtifactModal = () => {
        setIsArtifactModalOpen(false);
        setSelectedArtifact(null);
    };

    const handleArtifactUpdate = (artifactId, newStatus) => {
        setArtifacts(prevArtifacts =>
            prevArtifacts.map(artifact =>
                artifact.id === artifactId
                    ? { ...artifact, status: newStatus }
                    : artifact
            )
        );
    };
    
const handleOpenOtiModal = () => {
    if (sac.internalWorkOrders && sac.internalWorkOrders.length > 0) {
        setOtiData(sac.internalWorkOrders[0]);
        setShowOtiModal(true);
    }
};

const handleCloseOtiForm = () => {
    setOtiData(null);
    setShowOtiModal(false);
};


const handleClose = () => {
    if (status === 'Open' && sac.status === 'Closed') {
        dispatch(updateSAC({ 
            id: sac.id, 
            sacData: { 
                ...sac, 
                status: 'Open',
                closeDate: null,
                closeTime: null,
                closedBy: null
            } 
        }));
    }
    onClose();
}




    
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={handleClose}>
                    <AiOutlineClose />
                </button>
            <h2 className={styles.title}>Reclamo S.A.C #{sac.id}  <span className={styles.statusCircle2} style={{backgroundColor: status !== 'Closed' ? 'orange' : 'green'}}></span></h2>
            <hr />
            <div className={styles.modalContent2}>
            

            {/* Detalles del Reclamo */}
            <fieldset className={`${styles.fieldset} ${styles.fieldset1}`}>
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
                {status === 'Closed' && (
                    <>
                        <hr className={styles.divider} />
                        <h4 className={styles.closedTitle}>SAC CERRADA</h4>
                        <div className={styles.fieldDate}>
                        <div className={styles.field}>
                            <label className={styles.boldLabel}>Fecha de Cierre:</label>
                            <label>{formatDate(sac.closeDate)}</label>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.boldLabel}>Hora de Cierre:</label>
                            <label>{handleMissingValue(sac.closeTime)}</label>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.boldLabel}>Cerrado por:</label>
                            <label>{handleMissingValue(sac.closedBy)}</label>
                        </div>
                        </div>
                    </>
                    )}
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
                                    <th className={styles.colStatus}>Estado</th>
                                    <th className={styles.colActions}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artifacts.map((artifact) => (
                                    <tr key={artifact.id}>
                                        <td className={styles.colArtifact}>{artifact.name}</td>
                                        <td className={styles.colBrand}>{`${artifact.brand} ${artifact.model} ${artifact.serialNumber}`}</td>
                                        <td className={styles.colStatus}>
                                            <span
                                                className={`${styles.statusCircle} ${
                                                    artifact.status === 'Pending'
                                                        ? styles.redCircle
                                                        : artifact.status === 'In Progress'
                                                        ? styles.orangeCircle
                                                        : styles.greenCircle
                                                }`}
                                            ></span>
                                            {artifact.status === 'Pending' && 'Pendiente'}
                                            {artifact.status === 'In Progress' && 'En Curso'}
                                            {artifact.status === 'Completed' && 'Cerrado'}
                                        </td>
                                        <td className={styles.colActions}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleOpenArtifact(artifact)}
                                            >
                                                Abrir Artefacto
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                    </table>
                </fieldset>

             
                
            )}
             {isArtifactModalOpen && (
                       <Artifact 
                       sac={sac} 
                       artifactId={selectedArtifact.id} 
                       onUpdate={handleArtifactUpdate} 
                       onClose={handleCloseArtifactModal}
                       mode={selectedArtifact.status !== 'Completed' ? 'edit' : 'view'} 
                   />
                )}
            {/* Detalles del Reclamante */}
            {sac.claimantName && (
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Detalles del Reclamante</legend>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Nombre y Apellido del Reclamante:</label>
                        <label>{sac.claimantName}</label>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Relación con el Titular:</label>
                        <label>{sac.claimantRelationship}</label>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.boldLabel}>Teléfono del Reclamante:</label>
                        <label>{sac.claimantPhone}</label>
                    </div>
                </fieldset>
                )}
            {/* Detalles del Cliente */}
            {client2 && (
                <>
                <fieldset className={`${styles.fieldset} ${styles.fieldset2}`}>
                    <legend className={styles.legend}>Detalles del Titular de la cuenta</legend>
                    <div className={styles.section}>
                        <EditableField
                            label="Número de Cuenta:"
                            value={client2.accountNumber}
                            isEditable={isEditable.accountNumber}
                            onEdit={() => toggleEdit('accountNumber')}
                            onSave={(newValue) => handleSave('accountNumber', newValue)}
                        />
                        <EditableField
                            label="Nombre del Titular:"
                            value={client2.holderName}
                            isEditable={isEditable.holderName}
                            onEdit={() => toggleEdit('holderName')}
                            onSave={(newValue) => handleSave('holderName', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Dirección:"
                            value={client2.address}
                            isEditable={isEditable.address}
                            onEdit={() => toggleEdit('address')}
                            onSave={(newValue) => handleSave('address', newValue)}
                        />
                        <EditableField
                            label="Info. Adicional Dirección:"
                            value={client2.extraAddressInfo}
                            isEditable={isEditable.extraAddressInfo}
                            onEdit={() => toggleEdit('extraAddressInfo')}
                            onSave={(newValue) => handleSave('extraAddressInfo', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Dirección Postal:"
                            value={client2.postalAddress}
                            isEditable={isEditable.postalAddress}
                            onEdit={() => toggleEdit('postalAddress')}
                            onSave={(newValue) => handleSave('postalAddress', newValue)}
                        />
                        <EditableField
                            label="Info. Adicional Postal:"
                            value={client2.extraPostalAddressInfo}
                            isEditable={isEditable.extraPostalAddressInfo}
                            onEdit={() => toggleEdit('extraPostalAddressInfo')}
                            onSave={(newValue) => handleSave('extraPostalAddressInfo', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Teléfono:"
                            value={client2.phone || ''}
                            isEditable={isEditable.phone}
                            onEdit={() => toggleEdit('phone')}
                            onSave={(newValue) => handleSave('phone', newValue)}
                        />
                        <EditableField
                            label="Teléfono Auxiliar:"
                            value={client2.auxPhone || ''}
                            isEditable={isEditable.auxPhone}
                            onEdit={() => toggleEdit('auxPhone')}
                            onSave={(newValue) => handleSave('auxPhone', newValue)}
                        />
                    </div>
                </fieldset>

                <fieldset className={`${styles.fieldset} ${styles.fieldset3}`}>
                    <legend className={styles.legend}>Datos Eléctricos (Titular)</legend>
                    <div className={styles.section}>
                        <EditableField
                            label="Estado"
                            value={client2.status}
                            isEditable={isEditable.status}
                            onEdit={() => toggleEdit('status')}
                            onSave={(newValue) => handleSave('status', newValue)}
                        />
                        <EditableField
                            label="Servicio"
                            value={client2.service}
                            isEditable={isEditable.service}
                            onEdit={() => toggleEdit('service')}
                            onSave={(newValue) => handleSave('service', newValue)}
                        />
                        </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Categoría"
                            value={client2.category}
                            isEditable={isEditable.category}
                            onEdit={() => toggleEdit('category')}
                            onSave={(newValue) => handleSave('category', newValue)}
                        />
                        <EditableField
                            label="Voltaje"
                            value={client2.voltage}
                            isEditable={isEditable.voltage}
                            onEdit={() => toggleEdit('voltage')}
                            onSave={(newValue) => handleSave('voltage', newValue)}
                        />
                    </div>
                    <hr className={styles.sectionSeparator} />
                    <div className={styles.section}>
                         <EditableField
                            label="N° Suministro"
                            value={client2.supply}
                            isEditable={isEditable.supply}
                            onEdit={() => toggleEdit('supply')}
                            onSave={(newValue) => handleSave('supply', newValue)}
                        />
                        <EditableField
                            label="Disribuidor"
                            value={client2.distributor}
                            isEditable={isEditable.distributor}
                            onEdit={() => toggleEdit('distributor')}
                            onSave={(newValue) => handleSave('distributor', newValue)}
                        />
                        
                        
                    </div>
                    <div className={styles.section}>
                         <EditableField
                            label="SETA"
                            value={client2.substation}
                            isEditable={isEditable.substation}
                            onEdit={() => toggleEdit('substation')}
                            onSave={(newValue) => handleSave('substation', newValue)}
                        />
                        <EditableField
                            label="Salida BT"
                            value={client2.outputBT}
                            isEditable={isEditable.outputBT}
                            onEdit={() => toggleEdit('outputBT')}
                            onSave={(newValue) => handleSave('outputBT', newValue)}
                        />
                        
                        
                    </div>
                    <div className={styles.section}>
                    <EditableField
                            label="N° Medidor"
                            value={client2.device}
                            isEditable={isEditable.device}
                            onEdit={() => toggleEdit('device')}
                            onSave={(newValue) => handleSave('device', newValue)}
                        />
                        <EditableField
                            label="Acometida"
                            value={client2.connection}
                            isEditable={isEditable.connection}
                            onEdit={() => toggleEdit('connection')}
                            onSave={(newValue) => handleSave('connection', newValue)}
                        />
                    </div>
                    <hr className={styles.sectionSeparator} />
                    <div className={styles.section}>
                        <EditableField
                            label="Longitud"
                            value={client2.wsg84Long}
                            isEditable={isEditable.wsg84Long}
                            onEdit={() => toggleEdit('wsg84Long')}
                            onSave={(newValue) => handleSave('wsg84Long', newValue)}
                        />
                        <EditableField
                            label="Latitud"
                            value={client2.wsg84Lati}
                            isEditable={isEditable.wsg84Lati}
                            onEdit={() => toggleEdit('wsg84Lati')}
                            onSave={(newValue) => handleSave('wsg84Lati', newValue)}
                        />
                    </div>
                   
                    {wsg84Lati && wsg84Long && (
                        <>
                            <hr className={styles.sectionSeparator} />
                            <div className={styles.mapContainer}>
                                <MapComponent latitude={parseFloat(wsg84Lati)} longitude={parseFloat(wsg84Long) } client={client2} sac={sac} />
                            </div>
                        </>
                    )}
                    <hr className={styles.sectionSeparator} />
                    <div className={styles.section}>
                        <EditableField
                            label="Zona"
                            value={client2.zone}
                            isEditable={isEditable.zone}
                            onEdit={() => toggleEdit('zone')}
                            onSave={(newValue) => handleSave('zone', newValue)}
                        />
                        <EditableField
                            label="Sector"
                            value={client2.sector}
                            isEditable={isEditable.sector}
                            onEdit={() => toggleEdit('sector')}
                            onSave={(newValue) => handleSave('sector', newValue)}
                        />
                    </div>
                    <div className={styles.section}>
                        <EditableField
                            label="Ruta"
                            value={client2.route}
                            isEditable={isEditable.route}
                            onEdit={() => toggleEdit('route')}
                            onSave={(newValue) => handleSave('route', newValue)}
                        />
                        </div>
                </fieldset>
    </>
            )}

       
                </div>
                <div className={styles.buttonsContainer}>
                    <button className={styles.actionButton} onClick={handleDerivar}>
                        Derivar
                    </button>
                    {sac.internalWorkOrders && sac.internalWorkOrders.length > 0 && (
                        <button className={styles.actionButton} onClick={handleOpenOtiModal}>
                            O.T.I
                        </button>
                    )}
{/*                     <button className={styles.actionButton} onClick={handleOpenResolutionModal}>
                        Resolucion
                    </button>
 */}

{/*                     <button className={styles.actionButton} onClick={handleOpenOtModal}>
                        O.Trabajo
                    </button> */}
{/*                    <button className={styles.actionButton} onClick={handleOpenOacModal}>
                        O.A.Cs
                    </button> */}
                    {oacs.length === 0 ? (
                        <button className={styles.actionButton} onClick={handleOpenOacForm}>
                        Generar OAC
                        </button>
                    ) : (
                        <button className={styles.actionButton} onClick={handleOpenOacModal}>
                        O.A.Cs
                        </button>
                    )}
                    { status !== 'Closed' ? (
                        <button className={`${styles.actionButton} ${styles.closeSacButton}`} onClick={handleCloseSAC}>
                            Finalizar S.A.C
                        </button>
                    ) : (
                        <button className={`${styles.actionButton} ${styles.reopenSacButton}`} onClick={handleReopenSAC}>
                            Reabrir S.A.C
                        </button>
                    )}                    
                </div>
            </div>
            {showOtiModal && otiData && (
                <OtiForm 
                    mode="view"  
                    onClose={handleCloseOtiForm} 
                    data={otiData} 
                />
            )}

            {isResolutionModalOpen && (
                <ResolutionModal
                sac={sac}
                onClose={handleCloseResolutionModal}
                />
            )}
           {isOacFormOpen && (
                <OacForm
                sac={sac}
                client={client2}
                onClose={handleCloseOacForm}
                onOacCreated={() => handleOacCreated(sac.id)}
                mode="create"
                />
            )}

            {isOacModalOpen && (
                <OacModal sac={sac} onClose={handleCloseOacModal} />
            )}
            {isOtModalOpen && (
                <OtModal sac={sac} onClose={handleCloseOtModal} />
            )}
        </div>
    );
};

export default Sac;


                    