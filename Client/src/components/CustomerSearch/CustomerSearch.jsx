import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientByAccountNumber, resetState } from '../../redux/slices/clientsSlice';
import styles from './CustomerSearch.module.css';

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const { client, status, error } = useSelector((state) => state.clients);

    const handleSearch = () => {
        if (searchTerm) {
            dispatch(fetchClientByAccountNumber(searchTerm));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            handleSearch();
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        dispatch(resetState()); // Reset the state
    };

    const isButtonDisabled = !client;

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div className={styles.tab}>
                    <h2>Búsqueda de Cliente</h2>
                </div>
            </div>
            <div className={styles.searchBar}>
                <label htmlFor="searchInput">N° de cuenta:</label>
                <input
                    type="text"
                    id="searchInput"
                    placeholder="Ingresa el número de cuenta"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSearch} disabled={!searchTerm}>
                    Buscar
                </button>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refrescar
                </button>
            </div>

            {status === 'loading' && <p>Cargando...</p>}
            {status === 'failed' && error === 'Client not found' && (
                <p className={styles.noResults}>No se encontró ningún cliente con ese número de cuenta.</p>
            )}
            {status === 'failed' && error !== 'Client not found' && <p>Error: {error}</p>}
            {status === 'succeeded' && client && (
                <div className={styles.customerDetails}>
                    <table>
                        <thead>
                            <tr>
                                <th>Número de Cuenta</th>
                                <th>Nombre Titular</th>
                                <th>Dirección</th>
                                <th>Categoría</th>
                                <th>Dispositivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{client.accountNumber}</td>
                                <td>{client.holderName}</td>
                                <td>{client.address} {client.extraAddressInfo}</td>
                                <td>{client.category}</td>
                                <td>{client.device}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className={styles.buttonContainer}>
                        <button 
                            className={styles.startSacButton}
                            disabled={isButtonDisabled}
                        >
                            Iniciar SAC
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSearch;
