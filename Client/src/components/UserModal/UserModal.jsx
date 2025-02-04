import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import styles from './UserModal.module.css';
import { createUser, updateUser, fetchAllUsers } from '../../redux/slices/userSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const UserModal = ({ isOpen, onClose, mode, user }) => {
  const dispatch = useDispatch();

  // Estados para los campos
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('Atencion al cliente');
  const [status, setStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Efecto para rellenar campos en modo edición
  useEffect(() => {
    if (mode === 'edit' && user) {
      setUsername(user.username);
      setPassword('');
      setName(user.name);
      setLastName(user.lastName);
      setRole(user.role);
      setStatus(user.status);
    } else {
      // Resetear campos en modo creación
      setUsername('');
      setPassword('');
      setName('');
      setLastName('');
      setRole('Atencion al cliente');
      setStatus('Active');
    }
  }, [mode, user]);

  const handleSave = () => {
    if (!username || (mode !== 'edit' && !password)) {
      Swal.fire('Error', 'Usuario y Contraseña son campos obligatorios.', 'error');
      return;
    }

    const userData = {
      username,
      name,
      lastName,
      role,
      status,
      ...(password && { password }),
    };

    if (mode === 'edit' && user) {
      dispatch(updateUser({ userId: user.id, userData }))
        .then(() => {
          Swal.fire('Éxito', 'El usuario ha sido actualizado.', 'success');
          dispatch(fetchAllUsers());
        })
        .catch(() => {
          Swal.fire('Error', 'Hubo un problema al actualizar el usuario.', 'error');
        });
    } else {
      dispatch(createUser(userData))
        .then(() => {
          Swal.fire('Éxito', 'El usuario ha sido creado.', 'success');
          dispatch(fetchAllUsers());
        })
        .catch(() => {
          Swal.fire('Error', 'Hubo un problema al crear el usuario.', 'error');
        });
    }
    onClose();
  };

  const handleChangePassword = () => {
    if (!password) {
      Swal.fire('Error', 'Por favor ingresa una nueva contraseña.', 'error');
      return;
    }

    // Aquí puedes manejar la lógica de cambiar la contraseña
    Swal.fire('Éxito', 'La contraseña ha sido actualizada.', 'success');
    handleSave();   
    setChangePasswordModalOpen(false);

  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}>
        <h2>{mode === 'edit' ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>

        {/* Campos */}
        <div className={styles.formGroup}>
          <label>Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            placeholder="Nombre de usuario"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Nombre"
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Apellido:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={styles.input}
            placeholder="Apellido"
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Área / Rol:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.select}
          >
            <option value="Admin">Admin</option>
            <option value="Atencion al cliente">Atención al Cliente</option>
            <option value="Artefactos Quemados">Artefactos Quemados</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Comercial">Comercial</option>
          </select>
        </div>


        <div className={styles.formGroup}>
          <label>Estado:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.select}
            
          >
            <option value="Active">Activo</option>
            <option value="Inactive">Inactivo</option>
          </select>
        </div>

        {/* Contraseña */}
        {mode === 'edit' ? (
          <div className={styles.formGroup}>
            <button
              onClick={() => setChangePasswordModalOpen(true)}
              className={styles.changePasswordButton}
            >
              Cambiar Contraseña
            </button>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label>Contraseña:</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Escribe la contraseña"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>
        )}

        {/* Mini Modal de Contraseña */}
        {isChangePasswordModalOpen && (
  <div className={styles.miniModalBackdrop}>
    <div className={styles.miniModal}>
      <h3>Cambiar Contraseña</h3>
      <input
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
        placeholder="Nueva contraseña"
        autoComplete="off"
      />
      <div className={styles.modalActions}>
        <button
          onClick={() => setChangePasswordModalOpen(false)}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
        <button
          onClick={handleChangePassword}
          className={styles.saveButton}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}


        {/* Botones de acción */}
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            {mode === 'edit' ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
