import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai'; 
import { fetchOACs } from '../../redux/slices/oacSlice';
import { updateSAC } from '../../redux/slices/sacsSlice';
import styles from './OacModal.module.css';
import OacForm from '../OacForm/OacForm';
import Swal from 'sweetalert2';


const OacModal = ({ sac, onClose,showStatusButton }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState(null); 
  const [selectedOac, setSelectedOac] = useState(null); 

  const { oacs, status, error } = useSelector((state) => state.oacs);

  useEffect(() => {
    if (sac) {
      dispatch(fetchOACs(sac.id)); 
    }
  }, [dispatch, sac]);

  const handleGenerateOAC = () => {
    setSelectedOac(null); 
    setFormMode('create');
    setShowForm(true);
  };

  const handleViewOAC = (oac) => {
    setSelectedOac(oac);
    setFormMode('view');
    setShowForm(true);
  };

  const handleEditOAC = (oac) => {
    setSelectedOac(oac);
    setFormMode('edit');
    setShowForm(true);
  };

  const renderStatus = (status) => {
    if (status === 'Open') {
      return (
        <span className={styles.statusInProgress}>
          <span className={styles.circleRed}></span> En curso
        </span>
      );
    } else if (status === 'Completed') {
      return (
        <span className={styles.statusCompleted}>
          <span className={styles.circleGreen}></span> Cerrado
        </span>
      );
    }
    return status; 
  };

  const handleCloseSAC = async () => {
    try {
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Estás seguro?',
        text: `¿Estás seguro de cerrar la S.A.C. ID ${sac.id}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
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
  
        await dispatch(updateSAC({ id: sac.id, sacData: updatedData })).unwrap();
  
        Swal.fire({
          icon: 'success',
          title: 'S.A.C Cerrada',
          text: 'El estado del S.A.C se ha actualizado correctamente.',
          confirmButtonText: 'OK',
        });
  
        onClose();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar el S.A.C. Por favor, intente nuevamente.',
        confirmButtonText: 'OK',
      });
    }
  };
  
  

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.title}>Ordenes de Atencion al Cliente (S.A.C #{sac.id})</h2>
        <hr />

        {showForm ? (
          <OacForm
            sac={sac}
            oac={selectedOac}  
            mode={formMode}    
            onClose={() => {setShowForm(false), dispatch(fetchOACs(sac.id))}}
          />
        ) : (
          <>
            <div className={styles.modalContent2}>
              {status === 'loading' && <p>Cargando órdenes...</p>}
              {status === 'failed' && <p>Error: {error}</p>}
              {status === 'succeeded' && oacs.length > 0 ? (
                <table className={styles.oacTable}>
                  <thead>
                    <tr>
                      <th>N° OAC</th>
                      <th>Estado</th>
                      <th>Ordenó</th>
                      <th>Realizó</th>
{/*                       <th>Fecha</th>
                      <th>Hora</th> */}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                  {oacs
                      .slice() 
                      .sort((a, b) => a.id - b.id) 
                      .map((oac) => (
                      <tr key={oac.id}>
                        <td>{oac.id}</td>
                        <td>{renderStatus(oac.status)}</td>
                        <td>{oac.assignedBy ? `${oac.assignedBy}` : 'N/A'}</td> 
                        <td>{oac.assignedPerson ? `${oac.assignedPerson}` : 'No asignado'}</td>
{/*                         <td>{new Date(oac.issueDate).toLocaleDateString()}</td>
                        <td>{oac.assignmentTime}</td>   */} 
                        <td className={styles.tdButton}>
                          {oac.status === 'Completed' ? (
                            <button
                              className={styles.iconButton}
                              onClick={() => handleViewOAC(oac)}
                            >
                              <AiOutlineEye /> 
                            </button>
                          ) : (
                            <button
                              className={styles.iconButton}
                              onClick={() => handleEditOAC(oac)}
                            >
                              <AiOutlineEdit /> 
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ):
              <p>No hay ordenes de atención al cliente asociadas a este S.A.C.</p>
              }
            </div>
            
            <div className={` ${(showStatusButton ? 1 : 0)+1 === 1 ? styles.singleButton : styles.buttonsContainer}`}>
            {showStatusButton && (
                <button
                  className={styles.actionButton}
                  onClick={handleCloseSAC}
                >
                  Cerrar S.A.C
                </button>
              )}
              <button className={styles.actionButton} onClick={handleGenerateOAC}>
                Generar nueva O.A.C
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OacModal;
