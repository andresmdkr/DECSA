import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Pagination } from '@mui/material';
import { AiOutlineSearch, AiOutlineSync, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { fetchInternalWorkOrders } from '../../redux/slices/otiSlice.js';
import Sac from '../Sac/Sac.jsx';
import OtiForm from '../OtiForm/OtiForm.jsx';
import styles from './InternalWorkOrdersTable.module.css';

const InternalWorkOrdersTable = () => {
    const dispatch = useDispatch();
    const { internalWorkOrders, status, error, total } = useSelector((state) => state.oti);
const sortedOrders = [...internalWorkOrders]

  .filter((oti) => oti.sac?.area === 'op_adm')
  .sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return b.id - a.id; 
  });



    
    
    const [currentPage, setCurrentPage] = useState(() => {
        return parseInt(localStorage.getItem("currentPage")) || 1;
    });
    const [sacSearch, setSacSearch] = useState('');
    const [otiSearch, setOtiSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const itemsPerPage = 20;

    const [showSac, setShowSac] = useState(false);
    const [selectedSac, setSelectedSac] = useState(null);

    const [showOtiForm, setShowOtiForm] = useState(false);
    const [selectedOti, setSelectedOti] = useState(null);
    const [formMode, setFormMode] = useState(null);

    
    useEffect(() => {
        dispatch(fetchInternalWorkOrders({ page: currentPage, limit: itemsPerPage }));
        localStorage.setItem("currentPage", currentPage);
    }, [dispatch, currentPage]);


    

    // Función para realizar la búsqueda
    const handleSearch = () => {
        setCurrentPage(1);
        dispatch(fetchInternalWorkOrders({
            sacId: sacSearch || null,
            otiId: otiSearch || null, 
            page: 1,
            limit: itemsPerPage,
        }));
    };

    // Función para manejar Enter en los inputs
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Función para limpiar los inputs al escribir en uno de ellos
    const handleSacChange = (event) => {
        setSacSearch(event.target.value);
        setOtiSearch(''); // Borra el input de OTI
    };

    const handleOtiChange = (event) => {
        setOtiSearch(event.target.value);
        setSacSearch(''); // Borra el input de SAC
    };

    // Función para resetear los filtros
    const handleReset1 = () => {
        setCurrentPage(1);
        handleReset();
    };

    const handleReset = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            setSacSearch('');
            setOtiSearch('');
  
            
            setTimeout(() => {
                setIsRefreshing(false);
            }, 300);

        }
        dispatch(fetchInternalWorkOrders({ page: currentPage, limit: itemsPerPage }));
    };

    const handleViewSac = (sac) => {
        setSelectedSac(sac);
        setShowSac(true);
    };

    const handleCloseSac = () => {
        setSelectedSac(null);
        setShowSac(false);
        handleReset();
    }

    const handleCloseOtiForm = (updatedOti = null) => {
        setShowOtiForm(false);
        setSelectedOti(null); 
        setFormMode(null); 
        setCurrentPage(1);
        handleReset();
    };
    

    const handleOpenOtiForm = (oti) => {
        console.log("entre")
        if (oti) {
            console.log("entre2")
            const mode = oti.status === 'Closed' ? 'view' : 'edit';
            setSelectedOti(oti);
            setFormMode(mode);
        } else {
            console.log("entre3")
            setSelectedOti(null); 
            setFormMode('create');
            
        }
        console.log("entre4")
        setShowOtiForm(true);
        setCurrentPage(1); 
    };

    return (
        <div className={styles.container}>
          
            <div className={styles.filterContainer}>
                {/* Buscador por N° SAC */}
                <div className={styles.searchContainer}>
                    <TextField
                        label="Buscar por N° SAC"
                        variant="outlined"
                        value={sacSearch}
                        onChange={handleSacChange}
                        onKeyDown={handleKeyPress} 
                        className={styles.searchBar}
                        size="small"
                    />
                    <button onClick={handleSearch} className={styles.searchButton}>
                        <AiOutlineSearch className={styles.icon} /> Buscar
                    </button>
                </div>



                <button 
                    onClick={handleReset1} 
                    className={`${styles.refreshButton} ${isRefreshing ? styles.spinnerIcon : ''}`} 
                    disabled={isRefreshing}
                >
                    <AiOutlineSync />
                </button>
            </div>

            <div className={styles.filterContainer}>
                            {/* Buscador por N° O.T.I */}
                            <div className={styles.searchContainer2}>
                    <TextField
                        label="Buscar por N° O.T.I"
                        variant="outlined"
                        value={otiSearch}
                        onChange={handleOtiChange}
                        onKeyDown={handleKeyPress} 
                        className={styles.searchBar}
                        size="small"
                    />
                    <button onClick={handleSearch} className={styles.searchButton}>
                        <AiOutlineSearch className={styles.icon} /> Buscar
                    </button>
                </div>
                <button className={styles.createOrderButton} onClick={() =>handleOpenOtiForm()}>Nuevo Reclamo por Orden de Trabajo</button>
                </div>

            {/* Tabla de resultados */}
            {status === 'loading' && (
                <div className={styles.loadingSpinner}>
                    <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                    <span>Cargando órdenes de trabajo...</span>
                </div>
            )}
            {status === 'failed' && <p className={styles.errorMessage}>Error: {error}</p>}
            {status === 'succeeded' && internalWorkOrders.length === 0 && (
                <p className={styles.noOrdersMessage}>No hay órdenes disponibles.</p>
            )}

            {status === 'succeeded' && internalWorkOrders.length > 0 && (
                <div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>N° SAC</th>
                                <th>N° O.T.I</th>
                                <th>Dirección</th>
                                <th>Tarea</th>
                                <th>Responsable👤</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOrders.map((oti) => (
                                <tr key={oti.id}>
                                    <td>{oti.sacId}</td>
                                    <td>{oti.id}</td>
                                    <td>{oti.location}</td>
                                    <td>{oti.task}</td>
                                    <td>{oti.assignedTo}</td>
                                    <td>
                                        <span 
                                            className={`${styles.statusCircle} 
                                                        ${oti.status === 'Pending' ? styles.statusPending : ''} 
                                                        ${oti.status === 'Open' ? styles.statusOpen : ''} 
                                                        ${oti.status === 'Closed' ? styles.statusClosed : ''}`} 
                                        ></span>
                                        {oti.status === 'Pending' ? ' Pendiente' :
                                        oti.status === 'Open' ? ' En curso' :
                                        oti.status === 'Closed' ? ' Cerrado' : ' Desconocido'}
                                    </td>

                                    <td>
                                        <button 
                                            className={styles.viewClaimButton} 
                                            onClick={() => handleViewSac(oti.sac)}
                                        >
                                            Ver Reclamo
                                        </button>                                  
                                        <button 
                                        className={styles.viewOtiButton} 
                                        onClick={() => handleOpenOtiForm(oti)}
                                        >
                                        Ver O.T.I 📄
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showSac && selectedSac && (
                        <Sac sac={selectedSac} onClose={handleCloseSac} />
                    )}         
                   {console.log("Valor de showOtiForm:", showOtiForm)}
                          
                    <div className={styles.paginationContainer}>
                        <Pagination
                            count={total ? Math.ceil(total / itemsPerPage) : 1} 
                            page={currentPage}
                            onChange={(event, value) => setCurrentPage(value)}
                            color="primary"
                        />
                    </div>
                </div>
            )}
              {showOtiForm && (
                    <OtiForm 
                        mode={formMode} 
                        onClose={() => handleCloseOtiForm()} 
                        data={selectedOti} 
                    />
                )}
        </div>
    );
};

export default InternalWorkOrdersTable;
