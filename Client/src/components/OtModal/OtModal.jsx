import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai';
import { fetchWorkOrders } from '../../redux/slices/otSlice'; 
import OtForm from '../OtForm/OtForm.jsx'; 
import styles from './OtModal.module.css';

const OtModal = ({ sac, onClose }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState(null); 
  const [selectedOt, setSelectedOt] = useState(null); 

  const { workOrders, status, error } = useSelector((state) => state.ot);

  useEffect(() => {
    if (sac) {
      dispatch(fetchWorkOrders({ sacId: sac.id }));
    }
  }, [dispatch, sac]);

  const handleGenerateOt = () => {
    setSelectedOt(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleViewOt = (ot) => {
    setSelectedOt(ot);
    setFormMode('view');
    setShowForm(true);
  };

  const handleEditOt = (ot) => {
    setSelectedOt(ot);
    setFormMode('edit');
    setShowForm(true);
  };

  const renderStatus = (status) => {
    if (status === 'In Progress') {
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.title}>Órdenes de Trabajo (S.A.C #{sac.id})</h2>
        <hr />

        {showForm ? (
          <OtForm
            sacId={sac.id}
            ot={selectedOt} 
            mode={formMode}    
            onClose={() => { setShowForm(false); dispatch(fetchWorkOrders({ sacId: sac.id })); }}
          />
        ) : (
          <>
            <div className={styles.modalContent2}>
              {status === 'loading' && <p>Cargando órdenes...</p>}
              {status === 'failed' && <p>Error: {error}</p>}
              {status === 'succeeded' && workOrders.length > 0 ? (
                <table className={styles.otTable}>
                  <thead>
                    <tr>
                      <th>Número O.T</th>
                      <th>Estado</th>
                      <th>Motivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{renderStatus(order.status)}</td>
                        <td>{order.reason}</td>
                        <td className={styles.tdButton}>
                            {order.status === 'Completed' ?(
                          <button
                            className={styles.iconButton}
                            onClick={() => handleViewOt(order)}
                          >
                            <AiOutlineEye />
                          </button>
                        ):(
                          <button
                            className={styles.iconButton}
                            onClick={() => handleEditOt(order)}
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
              <p>No hay ordenes de trabajo asociadas a este S.A.C.</p>
  
              }
            </div>

            <div className={styles.buttonsContainer}>
              <button className={styles.actionButton} onClick={handleGenerateOt}>
                Generar nueva O.T.
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OtModal;
