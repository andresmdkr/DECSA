import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { Pagination } from '@mui/material';
import Swal from 'sweetalert2';
import styles from './UserTable.module.css';
import { fetchAllUsers, deleteUser } from '../../redux/slices/userSlice';
import UserModal from '../UserModal/UserModal.jsx';

const UserTable = () => {
  const dispatch = useDispatch();
  const { users = [], error } = useSelector((state) => state.users);

  // Estados para paginación y modal
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Efecto para cargar usuarios
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch, refresh]);

  const handleRefresh = () => setRefresh((prev) => !prev);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!id) return Swal.fire('Error', 'ID de usuario no válido.', 'error');

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
        dispatch(deleteUser(id)).then(() => {
          Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
          handleRefresh();
        });
      }
    });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handlePageChange = (event, value) => setCurrentPage(value);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className={styles.tableContainer}>
      {error && <div className={styles.error}>Error: {error}</div>}
      {users.length === 0 ? (
        <p className={styles.error2}>No se encontraron usuarios</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Area / Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td className={styles.ellipsis}>{user.username}</td>
                <td className={styles.ellipsis}>{`${user.name} ${user.lastName}`}</td>
                <td className={styles.ellipsis}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </td>
                <td>
                <span
                    className={`${styles.statusCircle} ${
                    user.status === 'Active' ? styles.active : styles.inactive
                    }`}
                ></span>
                {user.status === 'Active' ? 'Activo' : 'Inactivo'}
                </td>

                <td>
                  <button
                    onClick={() => handleEdit(user)}
                    className={`${styles.iconButton} ${styles.editButton}`}
                  >
                    <AiOutlineEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
        <button onClick={handleCreateUser} className={styles.createButton}>
          Crear nuevo usuario
        </button>
        <Pagination
          count={Math.ceil(users.length / usersPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': { color: '#007bff' },
            '& .MuiPaginationItem-root:hover': { backgroundColor: '#e3f2fd' },
            '& .Mui-selected': { backgroundColor: '#0056b3 !important', color: '#fff' },
          }}
        />
      </div>

      {/* Modal para crear o editar usuario */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        user={selectedUser}
      />
    </div>
  );
};

export default UserTable;
