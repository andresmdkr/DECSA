import React, { useState, useEffect,useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientByAccountNumber, searchClientsByName, resetState } from '../../redux/slices/clientsSlice';
import styles from './Clients.module.css';
import { AiOutlineLoading3Quarters, AiOutlineSearch, AiOutlineSync } from 'react-icons/ai';
import CustomerDetails from '../CustomerDetails/CustomerDetails.jsx';



const Clients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('search'); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [manualSelection, setManualSelection] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const { client, status, error, clients } = useSelector((state) => state.clients);


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            dispatch(searchClientsByName(debouncedSearchTerm));
        }
    }, [debouncedSearchTerm, dispatch]);

    



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false); 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAccountSearch = () => {
        if (accountSearchTerm) {
            dispatch(fetchClientByAccountNumber(accountSearchTerm));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (accountSearchTerm) {
                handleAccountSearch();
            } else if (searchTerm === '' && clients.length > 0) {
                handleRefresh();
            } else if (selectedIndex >= 0) {
                setSearchTerm(clients[selectedIndex].holderName);
                setAccountSearchTerm(clients[selectedIndex].accountNumber);
                dispatch(fetchClientByAccountNumber(clients[selectedIndex].accountNumber));
                setShowDropdown(false);
                setManualSelection(true);
                setSelectedIndex(-1);
            } else if (clients.length > 0 && selectedIndex === -1) {
                setSearchTerm(clients[0].holderName);
                setAccountSearchTerm(clients[0].accountNumber);
                dispatch(fetchClientByAccountNumber(clients[0].accountNumber));
                setShowDropdown(false);
                setManualSelection(true);
            }
          } else if (e.key === 'ArrowDown' && clients.length > 0 && selectedIndex < clients.length - 1) { 
            console.log(selectedIndex);
            e.preventDefault(); 
            setSelectedIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % clients.length;
                return nextIndex;
            });
        } else if (e.key === 'ArrowUp' && clients.length > 0 && selectedIndex > 0) {
            console.log(selectedIndex);
            e.preventDefault(); 
            setSelectedIndex((prevIndex) => {
                console.log
                const nextIndex = (prevIndex - 1 ) % clients.length;
                 
                return nextIndex;
            });
        }
    };
    

    const handleAccountInputChange = (e) => {
        setSearchTerm('');
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 200) {
            setAccountSearchTerm(value);
        }
    };

    const handleSearchInputChange = (e) => {
        setAccountSearchTerm('');
        const value = e.target.value;
        if (value.length <= 200 ) {
            setSearchTerm(value);
            setShowDropdown(true); 
        }
    };

    const handleRefresh = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            setAccountSearchTerm('');
            setSearchTerm('');
            dispatch(resetState());

            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        }
    };

    const handleSelectClient = (client) => {
        setShowDropdown(false);
        setSearchTerm(client.holderName);
        setAccountSearchTerm(client.accountNumber);
        setManualSelection(true); 
        dispatch(fetchClientByAccountNumber(client.accountNumber));
    };

    const handleViewDetails = () => {
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
    };


    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONECTADO':
                return <span className={styles.connectedIcon} />;
            case 'BAJA':
                return <span className={styles.disconnectedIcon} />;
            case 'PENDIENTE':
            case 'PENDIENTE_CONEXION':
                return <span className={styles.pendingIcon} />;
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
                    <h2>Busqueda de Clientes</h2>
                </div>
            </div>

            {activeTab === 'search' && (
                <div className={styles.container2}>
                <div >
                    {/* Contenido de la búsqueda de clientes */}
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            id="accountSearchInput"
                            placeholder="Ingresa el número de cuenta"
                            value={accountSearchTerm}
                            onChange={handleAccountInputChange}
                            onKeyDown={handleKeyDown}
                            maxLength="200"
                        />
                        <button onClick={handleAccountSearch} disabled={!accountSearchTerm} className={styles.searchButton}>
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
                <div className={styles.searchContainer}>
                    <div className={styles.searchBar}>
                    <input
                    type="text"
                    id="nameSearchInput"
                    placeholder="Ingresa el nombre del titular"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete='off'
                     maxLength="200"
                />
                {showDropdown && clients.length > 0 && searchTerm.length > 0 && (
                    <ul className={styles.searchResults} ref={dropdownRef}>
                        {clients.map((client, index) => (
                            <li
                                key={client.accountNumber}
                                onClick={() => handleSelectClient(client)}
                                className={index === selectedIndex ? styles.highlighted : ''}
                            >
                                {client.holderName}
                            </li>
                        ))}
                    </ul>
                )}
                    </div>
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
                                        {/* <td>{client.address} {client.extraAddressInfo}</td> */}
                                        <td>{client.address} </td>
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
                        </div>
                    )}
                    {showDetails && <CustomerDetails client={client} onClose={closeDetails} />}

                </div>
                </div>
            )}


        </div>
    );
};

export default Clients;
