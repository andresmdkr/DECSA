import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { Pagination } from '@mui/material';
import Swal from 'sweetalert2';
import styles from './OperationalAgentTable.module.css';
import { fetchAllTechnicalServices, deleteTechnicalService } from '../../redux/slices/technicalServiceSlice.js';
import OperationalAgentModal from '../OperationalAgentModal/OperationalAgentModal.jsx';

const OperationalAgentTable = () => {
  const dispatch = useDispatch();
  const { technicalServices, error } = useSelector(state => state.technicalService);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 9;

  useEffect(() => {
    dispatch(fetchAllTechnicalServices());
  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen) {
      dispatch(fetchAllTechnicalServices());
    }
  }, [isModalOpen, dispatch]);

  const handleEdit = (agent) => {
    setSelectedAgent(agent);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAgent(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteTechnicalService(id));
        Swal.fire('Eliminado', 'El agente operativo ha sido eliminado.', 'success');
      }
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const filteredOperationalAgents = technicalServices.filter(service => service.area === 'operaciones');

  const sortedOperationalAgents = [...filteredOperationalAgents].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = sortedOperationalAgents.slice(indexOfFirstAgent, indexOfLastAgent);

  return (
    <div className={styles.tableContainer}>
      {error && <div className={styles.error}>Error: {error}</div>}
      {filteredOperationalAgents.length === 0 ? (
        <p className={styles.error2}>No se encontraron agentes operativos</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
                <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentAgents.map((agent) => (
              <tr key={agent.id}>
                <td className={styles.truncateCell} title={agent.name}>{agent.name}</td>
                <td>{agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}</td>
                <td className={styles.truncateCell} title={agent.phone}>{agent.phone?.trim() ? agent.phone : 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(agent)}
                    className={`${styles.iconButton} ${styles.editButton}`}
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                  >
                    <AiOutlineDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.paginationContainer}>
        <Pagination
          count={Math.ceil(filteredOperationalAgents.length / agentsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          className={styles.pagination}
        />
        <button onClick={handleCreate} className={styles.createButton}>
          Crear Nuevo Agente Operativo
        </button>
      </div>

      {isModalOpen && (
        <OperationalAgentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          technicalService={selectedAgent}
        />
      )}
    </div>
  );
};

export default OperationalAgentTable;
