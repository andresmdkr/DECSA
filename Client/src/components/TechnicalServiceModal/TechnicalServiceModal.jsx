import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import styles from './TechnicalServiceModal.module.css';
import { createTechnicalService, updateTechnicalService, fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';

const TechnicalServiceModal = ({ isOpen, onClose, mode, technicalService }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('contratista');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (mode === 'edit' && technicalService) {
      setName(technicalService.name);
      setType(technicalService.type);
      setAddress(technicalService.address || '');
      setPhone(technicalService.phone || '');
    } else {
      setName('');
      setType('contratista');
      setAddress('');
      setPhone('');
    }
  }, [mode, technicalService]);

  const handleSave = () => {
    const serviceData = { name, type, address, phone };

    if (mode === 'edit' && technicalService) {
      dispatch(updateTechnicalService({ ...serviceData, id: technicalService.id }))
        .then(() => {
          dispatch(fetchAllTechnicalServices());
          Swal.fire({
            title: 'Actualización exitosa',
            text: 'El servicio técnico ha sido actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        });
    } else {
      dispatch(createTechnicalService(serviceData))
        .then(() => {
          dispatch(fetchAllTechnicalServices());
          Swal.fire({
            title: 'Creación exitosa',
            text: 'El servicio técnico ha sido creado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}>
        <h2>{mode === 'edit' ? 'Editar Servicio Técnico' : 'Crear Nuevo Servicio Técnico'}</h2>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            maxLength="50"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="type">Tipo:</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
          >
            <option value="contratista">Contratista</option>
            <option value="personal propio">Personal Propio</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Domicilio:</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={styles.input}
            maxLength="100"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Teléfono:</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={styles.input}
            maxLength="20"
          />
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button onClick={handleSave} className={styles.saveButton}>
            {mode === 'edit' ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalServiceModal;
