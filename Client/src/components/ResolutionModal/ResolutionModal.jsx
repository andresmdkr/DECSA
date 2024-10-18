import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose, AiOutlineEdit, AiOutlineEye } from 'react-icons/ai';
import { fetchResolutions } from '../../redux/slices/resolutionSlice.js'; 
import ResolutionForm from '../ResolutionForm/ResolutionForm.jsx'; 
import styles from './ResolutionModal.module.css';

const ResolutionModal = ({ sac, onClose }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState(null); 
  const [selectedResolution, setSelectedResolution] = useState(null);

  const { resolutions, status, error } = useSelector((state) => state.resolution);

  useEffect(() => {
    if (sac) {
      dispatch(fetchResolutions({ sacId: sac.id }));
    }
  }, [dispatch, sac]);

  const handleCreateResolution = () => {
    setSelectedResolution(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleViewResolution = (resolution) => {
    setSelectedResolution(resolution);
    setFormMode('view');
    setShowForm(true);
  };

  const handleEditResolution = (resolution) => {
    setSelectedResolution(resolution);
    setFormMode('edit');
    setShowForm(true);
  };

  const renderStatus = (clientNotified) => (
    <span className={clientNotified ? styles.statusCompleted : styles.statusInProgress}>
      <span className={clientNotified ? styles.circleGreen : styles.circleRed}></span>
      {clientNotified ? 'Cerrado' : 'En curso'}
    </span>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <AiOutlineClose />
        </button>
        <h2 className={styles.title}>Resoluciones (S.A.C #{sac.id})</h2>
        <hr />

        {showForm ? (
          <ResolutionForm
            sacId={sac.id}
            resolution={selectedResolution} 
            mode={formMode} 
            onClose={() => {
              setShowForm(false);
              dispatch(fetchResolutions({ sacId: sac.id }));
            }}
          />
        ) : (
          <>
            <div className={styles.modalContent2}>
              {status === 'loading' && <p>Cargando resoluciones...</p>}
              {status === 'failed' && <p>Error: {error}</p>}
              {status === 'succeeded' && resolutions.length > 0 ? (
                <table className={styles.resolutionTable}>
                  <thead>
                    <tr>
                      <th>Resolución</th>
                      <th>Tipo de Resolucion</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolutions.map((resolution) => (
                      <tr key={resolution.id}>
                        <td>{resolution.id}</td>
                        <td>{resolution.type}</td>
                        <td>{renderStatus(resolution.clientNotified)}</td>
                        <td className={styles.tdButton}>
                          {resolution.clientNotified ? (
                            <button
                              className={styles.iconButton}
                              onClick={() => handleViewResolution(resolution)}
                            >
                              <AiOutlineEye />
                            </button>
                          ) : (
                            <button
                              className={styles.iconButton}
                              onClick={() => handleEditResolution(resolution)}
                            >
                              <AiOutlineEdit />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay resoluciones asociadas a este S.A.C.</p>
              )}
            </div>

            <div className={styles.buttonsContainer}>
              <button className={styles.actionButton} onClick={handleCreateResolution}>
                Crear nueva Resolución
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResolutionModal;
