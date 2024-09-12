import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose } from 'react-icons/ai';
import { fetchOACs } from '../../redux/slices/oacSlice';
import styles from './OacModal.module.css';
import OacForm from '../OacForm/OacForm';
import { useState } from 'react';

const OacModal = ({ sac, onClose }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false); // Estado para controlar el formulario
  
    const { oacs, status, error } = useSelector((state) => state.oacs);
  
    useEffect(() => {
      if (sac) {
        dispatch(fetchOACs(sac.id)); 
      }
    }, [dispatch, sac]);
  
    // Función para manejar el clic en "Generar nueva O.A.C"
    const handleGenerateOAC = () => {
      setShowForm(true); // Muestra el formulario cuando se haga clic
    };
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>
            <AiOutlineClose />
          </button>
          <h2 className={styles.title}>Ordenes de Atencion al Cliente (S.A.C #{sac.id})</h2>
          <hr />
          
          {showForm ? ( // Si showForm es true, muestra el componente OacForm
            <OacForm sac={sac} onClose={() => setShowForm(false)} />
          ) : (
            <>
              <div className={styles.modalContent2}>
                {status === 'loading' && <p>Cargando órdenes...</p>}
                {status === 'failed' && <p>Error: {error}</p>}
                {status === 'succeeded' && oacs.length > 0 && (
                  <table className={styles.oacTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Técnico Asignado</th>
                        <th>Fecha de Emisión</th>
                        <th>Resolución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oacs.map((oac) => (
                        <tr key={oac.id}>
                          <td>{oac.id}</td>
                          <td>{oac.status}</td>
                          <td>{oac.assignedTechnician || 'No asignado'}</td>
                          <td>{new Date(oac.emissionDate).toLocaleDateString()}</td>
                          <td>{oac.resolution || 'Pendiente'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className={styles.buttonsContainer}>
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