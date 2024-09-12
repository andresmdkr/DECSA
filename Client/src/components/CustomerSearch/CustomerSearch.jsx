import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientByAccountNumber, resetState } from '../../redux/slices/clientsSlice';
import styles from './CustomerSearch.module.css';
import { AiOutlineLoading3Quarters, AiOutlineSearch, AiOutlineSync } from 'react-icons/ai';
import CustomerDetails from '../CustomerDetails/CustomerDetails.jsx';
import SacForm from '../SacForm/SacForm.jsx'; 
import SacTable from '../SacTable/SacTable.jsx';

const CustomerSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showSacForm, setShowSacForm] = useState(false); 
    const [activeTab, setActiveTab] = useState('search'); 
    
    const dispatch = useDispatch();
    const { client, status, error } = useSelector((state) => state.clients);

    const handleSearch = () => {
        if (searchTerm) {
            dispatch(fetchClientByAccountNumber(searchTerm));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (searchTerm) {
                handleSearch();
            } else {
                handleRefresh();
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 200) {
            setSearchTerm(value);
        }
    };

    const handleRefresh = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            setSearchTerm('');
            dispatch(resetState());

            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        }
    };

    const handleViewDetails = () => {
        console.log(client);
        setShowDetails(true);
    };

    const handleStartSac = () => {
        if (client) {
            setShowSacForm(true); 
        }
    };

    const closeDetails = () => {
        setShowDetails(false);
    };

    const closeSacForm = () => {
        setShowSacForm(false); 
    };

    const isButtonDisabled = !client;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONECTADO':
                return <span className={styles.connectedIcon} />;
            case 'BAJA':
                return <span className={styles.disconnectedIcon} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div 
                    className={`${styles.tab} ${activeTab === 'search' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    <h2>Búsqueda de Cliente</h2>
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <h2>Historial Solicitudes</h2>
                </div>
            </div>

            {activeTab === 'search' && (
                <div>
                    {/* Contenido de la búsqueda de clientes */}
                    <div className={styles.searchBar}>
                        <label htmlFor="searchInput">N° de cuenta:</label>
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Ingresa el número de cuenta"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <button onClick={handleSearch} disabled={!searchTerm} className={styles.searchButton}>
                            <AiOutlineSearch className={styles.icon} /> Buscar
                        </button>
                        <button 
                            onClick={handleRefresh} 
                            className={`${styles.refreshButton} ${isRefreshing ? styles.spinnerIcon : ''}`} 
                            disabled={isRefreshing}
                        >
                            <AiOutlineSync />
                        </button>
                    </div>

                    {status === 'loading' && (
                        <div className={styles.loadingSpinner}>
                            <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                            <span>Cargando...</span>
                        </div>
                    )}
                    {status === 'failed' && error === 'Client not found' && (
                        <p className={styles.noResults}>No se encontró ningún cliente con ese número de cuenta.</p>
                    )}
                    {status === 'failed' && error !== 'Client not found' && (
                        <p className={styles.errorMessage}>Error: {error}</p>
                    )}
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
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{client.accountNumber}</td>
                                        <td>{client.holderName}</td>
                                        <td>{client.address} {client.extraAddressInfo}</td>
                                        <td>{client.category}</td>
                                        <td>{client.device}</td>
                                        <td>
                                            {getStatusIcon(client.status)}
                                            {client.status}
                                        </td>
                                        <td>
                                            <button onClick={handleViewDetails} className={styles.detailsButton}>
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className={styles.buttonContainer}>
                                <button 
                                    onClick={handleStartSac} 
                                    className={styles.startSacButton}
                                    disabled={isButtonDisabled}
                                >
                                    Iniciar SAC
                                </button>
                            </div>
                        </div>
                    )}
                    {showDetails && <CustomerDetails client={client} onClose={closeDetails} />}
                    {showSacForm && <SacForm client={client} onClose={closeSacForm} />} 
                </div>
            )}

            {activeTab === 'history' && (
                <div className={styles.historyTab}>
                    <SacTable />
                </div>
            )}
        </div>
    );
};

export default CustomerSearch;
