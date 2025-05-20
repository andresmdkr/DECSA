import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { Pagination } from '@mui/material';
import Swal from 'sweetalert2';
import styles from './TechnicalServiceTable.module.css';
import { fetchAllTechnicalServices, deleteTechnicalService } from '../../redux/slices/technicalServiceSlice.js';
import TechnicalServiceModal from '../TechnicalServiceModal/TechnicalServiceModal.jsx';

const TechnicalServiceTable = () => {
  const dispatch = useDispatch();
  const { technicalServices, error } = useSelector(state => state.technicalService);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 9;

  useEffect(() => {
    dispatch(fetchAllTechnicalServices());
  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen) {
      dispatch(fetchAllTechnicalServices());
    }
  }, [isModalOpen, dispatch]);

  const handleEdit = (service) => {
    setSelectedService(service);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedService(null);
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
        Swal.fire('Eliminado', 'El servicio técnico ha sido eliminado.', 'success');
      }
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };


const filteredTechnicalServices = technicalServices.filter(service => service.area === 'artefactos');

const sortedTechnicalServices = [...filteredTechnicalServices].sort((a, b) =>
  a.name.localeCompare(b.name)
);


  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = sortedTechnicalServices.slice(indexOfFirstService, indexOfLastService);

  return (
    <div className={styles.tableContainer}>
      {error && <div className={styles.error}>Error: {error}</div>}
      {filteredTechnicalServices.length === 0 ? (
        <p className={styles.error2}>No se encontraron servicios técnicos</p>
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
            {currentServices.map((service) => (
              <tr key={service.id}>
                <td className={styles.truncateCell} title={service.name}>{service.name}</td>
                <td>{service.type.charAt(0).toUpperCase() + service.type.slice(1)}</td>
                <td className={styles.truncateCell} title={service.phone}>{service.phone?.trim() ? service.phone : 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(service)}
                    className={`${styles.iconButton} ${styles.editButton}`}
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
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
          count={Math.ceil(filteredTechnicalServices.length / servicesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          className={styles.pagination}
        />
        <button onClick={handleCreate} className={styles.createButton}>
          Crear Nuevo Servicio Técnico
        </button>
      </div>

      {isModalOpen && (
        <TechnicalServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          technicalService={selectedService}
        />
      )}
    </div>
  );
};

export default TechnicalServiceTable;
