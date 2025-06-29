import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Pagination, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AiOutlineSearch, AiOutlineSync, AiOutlineLoading3Quarters, AiOutlineFilePdf } from 'react-icons/ai';
import { fetchSACs, updateSAC } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice.js';
import styles from './OngoingClaimsTable.module.css';
import OacModal from '../OacModal/OacModal';
import OacForm from '../OacForm/OacForm.jsx';
import Sac from '../Sac/Sac.jsx';

const OngoingClaimsTable = () => {
    const dispatch = useDispatch();
    const { sacs, status, error, total } = useSelector((state) => state.sacs);
    const [currentPage, setCurrentPage] = useState(1);
    const [sacIdSearch, setSacIdSearch] = useState('');
    const [clientIdSearch, setClientIdSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const sacsPerPage = 20;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedSac, setSelectedSac] = useState(null);
    const [showOacModal, setShowOacModal] = useState(false);
    const [showSac, setShowSac] = useState(false);  
    const [clients, setClients] = useState({}); 
    const [sortOption, setSortOption] = useState('id');
    const [isOacFormOpen, setIsOacFormOpen] = useState(false);
    const [oacFormSac, setOacFormSac] = useState(null);


    const [searchParams, setSearchParams] = useState({
        sacId: '',
        clientId: '',
    });

    const statusMap = {
        'Pendiente': 'Pending',
        'En Curso': 'Open',
        'Cerrado': 'Closed'
    };

    const mapStatusToSpanish = (status) => {
        const map = {
            'Pending': 'Pendiente',
            'Open': 'En Curso',
            'Closed': 'Cerrado'
        };
        return map[status] || status;
    };

    const mapStatusToClass = (status) => {
    const statusClasses = {
        'Pending': 'statusPending',
        'Open': 'statusOpen',
        'Closed': 'statusClosed',
    };
    return statusClasses[status] || 'statusDefault';
};

    const capitalizePriority = (priority) => priority.charAt(0).toUpperCase() + priority.slice(1);
    const capitalizeClaimReason = (reason) => reason.charAt(0).toUpperCase() + reason.slice(1); 

    useEffect(() => {
        if (!isRefreshing) {
            dispatch(fetchSACs({
                page: currentPage,
                limit: sacsPerPage,
                sacId: searchParams.sacId,
                clientId: searchParams.clientId,
                status: statusFilter || ["Pending", "Open"],
                priority: priorityFilter,
                area:"operaciones",
                sort: sortOption,
            }));
        }
    }, [dispatch, currentPage, statusFilter, priorityFilter, sacsPerPage, searchParams, isRefreshing, sortOption]);

    useEffect(() => {
            const fetchClients = async () => {
                const clientData = {};
                for (const sac of sacs) {
                    if (sac.clientId && !clients[sac.clientId]) { 
                        try {
                            const response = await dispatch(fetchClientByAccountNumber(sac.clientId)).unwrap();
                            clientData[sac.clientId] = response;
                        } catch (error) {
                            console.error(`Error obteniendo cliente ${sac.clientId}:`, error);
                        }
                    }
                }
                setClients((prev) => ({ ...prev, ...clientData }));
            };
    
            if (sacs.length > 0) {
                fetchClients();
            }
        }, [sacs, dispatch]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearch = () => {
        setSearchParams({
            sacId: sacIdSearch,
            clientId: clientIdSearch,
        });
        setCurrentPage(1);
    };

    const handleReset = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            setSacIdSearch('');
            setClientIdSearch('');
            setStatusFilter('');
            setPriorityFilter('');
            setCurrentPage(1);

            setSearchParams({
                sacId: '',
                clientId: ''
            });

            setTimeout(() => {
                setIsRefreshing(false);
            }, 300);
        }
    };

    const handleSortChange = (e) => {
    setSortOption(e.target.value);
    };

        const handleStatusChange = (e) => {
        setSearchParams({
            sacId: '',
            clientId: clientIdSearch || '',
        });
        setSacIdSearch('');
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePriorityChange = (e) => {
        setSearchParams({
            sacId: '',
            clientId: clientIdSearch || '',
        });
        setSacIdSearch('');
        setPriorityFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 9) {
            setPriorityFilter('');
            setStatusFilter('');
            setClientIdSearch('');
            setSacIdSearch(value);
        }
    };

    const handleClientIdInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 9) {
            setPriorityFilter('');
            setStatusFilter('');
            setSacIdSearch('');
            setClientIdSearch(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleViewOac = (sac) => {
        console.log('Ver O.A.Cs', sac);  
        setSelectedSac(sac);  
        setShowOacModal(true);  
    };

    const handleCloseOacModal = () => {
        handleReset();
        setShowOacModal(false);  
    };
    

    const handleViewSac = (sac) => {
        setSelectedSac(sac);
        setShowSac(true);
      };
      
      const handleCloseSac = () => {
        setShowSac(false);
        setSelectedSac(null);
        handleReset();
      };

      const handleOpenOacForm = (sac) => {
    
    setOacFormSac(sac);
    setIsOacFormOpen(true);
};

const handleCloseOacForm = async ({ sacStatus, oacStatus }) => {
  const shouldOpenSac = sacStatus === 'Pending' && oacStatus !== 'Completed' && oacStatus ;

  if (shouldOpenSac) {
    await dispatch(updateSAC({ id: oacFormSac.id, sacData: { status: 'Open' } }));
  }

  setIsOacFormOpen(false);
  setOacFormSac(null);
  handleReset();
};




      const sortedSacs = [...sacs].sort((a, b) => {
        if (sortOption === 'status') {
            const order = { 'Pending': 1, 'Open': 2 };
            return order[a.status] - order[b.status];
        } else if (sortOption === 'id') {
            return b.id - a.id; 
        }
        return 0;
        });


    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                {/* Search Input for SAC */}
                <div className={styles.searchContainer}>
                    <TextField
                        label="Buscar por Número de SAC"
                        variant="outlined"
                        value={sacIdSearch}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleKeyDown}
                        className={styles.searchBar}
                        size="small"
                    />
                    <button onClick={handleSearch} className={styles.searchButton}>
                        <AiOutlineSearch className={styles.icon} /> Buscar
                    </button>
                </div>

                {/* Estado Filter */}
                <div className={styles.filters}>
                    <FormControl variant="outlined" className={styles.filter}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            label="Estado"
                        >
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            <MenuItem value="Pending">Pendiente</MenuItem>
                            <MenuItem value="Open">En Curso</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={styles.filter}>
                        <InputLabel>Prioridad</InputLabel>
                        <Select
                            value={priorityFilter}
                            onChange={handlePriorityChange}
                            label="Prioridad"
                        >
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            <MenuItem value="alta">Alta</MenuItem>
                            <MenuItem value="media">Media</MenuItem>
                            <MenuItem value="baja">Baja</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={styles.filter}>
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                        value={sortOption}
                        onChange={handleSortChange}
                        label="Ordenar por"
                    >
                        <MenuItem value="status">Pendientes primero</MenuItem>
                        <MenuItem value="id">N°de SAC</MenuItem>
                    </Select>
                    </FormControl>
                    <button
                        onClick={handleReset}
                        className={`${styles.refreshButton} ${isRefreshing ? styles.spinnerIcon : ''}`}
                        disabled={isRefreshing}
                    >
                        <AiOutlineSync />
                    </button>
                </div>
            </div>

            {/* Nuevo Search Input para Client ID */}
            <div className={styles.searchContainer2}>
                <TextField
                    label="Buscar por Número de Cuenta"
                    variant="outlined"
                    value={clientIdSearch}
                    onChange={handleClientIdInputChange}
                    onKeyDown={handleKeyDown}
                    className={styles.searchBar}
                    size="small"
                />
                <button onClick={handleSearch} className={styles.searchButton}>
                    <AiOutlineSearch className={styles.icon} /> Buscar
                </button>
            </div>

            {/* Loading Spinner */}
            {status === 'loading' && (
                <div className={styles.loadingSpinner}>
                    <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                    <span>Cargando SACs...</span>
                </div>
            )}

            {/* Error Message */}
            {status === 'failed' && <p>Error: {error}</p>}

            {/* No SACs Available */}
            {status === 'succeeded' && sacs.length === 0 && <p>No hay SACs disponibles.</p>}
            {console.log(sacs)}
            {/* SAC Table */}
            {status === 'succeeded' && sacs?.length > 0 && (
                <div>
                    <table className={styles.table}>
                    <thead>
                            <tr>
                                <th className={styles.ellipsisCell}>SAC</th>
                                <th className={styles.ellipsisCell}>Estado</th>
                                <th className={styles.ellipsisCell}>Prioridad</th>
                                <th className={styles.ellipsisCell}>Motivo</th>
                                <th className={styles.ellipsisCell}>Responsable👤</th> 
                                <th className={styles.ellipsisCell}>Dirección</th>
                                <th className={styles.ellipsisCell}>Cuenta</th>
                                <th className={styles.ellipsisCell}>Nombre Titular</th>                               
                                <th className={styles.ellipsisCell}>Fecha</th>                                 
                                <th className={styles.ellipsisCell}>Acciones</th>
                            </tr>
                    </thead>
                    <tbody>
                        {sortedSacs.map((sac) => {
                        const customerServiceOrders = sac.customerServiceOrders || [];
                        const lastOrder = customerServiceOrders[customerServiceOrders.length - 1];
                        const assignedPerson = lastOrder?.assignedPerson || "N/A";

                        const formattedDate = new Date(sac.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        });

                        const client = clients[sac.clientId] || {};
                        console.log(sac);
                        return (
                            <tr
                            key={sac.id}
                            className={`
                                ${sac.priority === 'alta' ? styles.highPriorityRow : ''}
                                ${sac.priority === 'media' ? styles.mediumPriorityRow : ''}
                                ${sac.priority === 'baja' ? styles.lowPriorityRow : ''}
                            `}
                            >
                            <td>{sac.id}</td>
                            <td>
                                <div className={styles.statusContainer}>
                                <span className={`${styles.statusCircle} ${styles[mapStatusToClass(sac.status)]}`}></span>
                                {mapStatusToSpanish(sac.status)}
                                </div>
                            </td>
                            <td>{capitalizePriority(sac.priority)}</td>
                            <td>{capitalizeClaimReason(sac.claimReason)}</td>
                            <td className={styles.ellipsisCell}>{assignedPerson}</td>
                            <td className={styles.ellipsisCell}>
                                {client.address ? `${client.address}` : "N/A"}
                            </td>
                             {/* <td className={styles.ellipsisCell}>
                                {client.address ? `${client.address}, ${client.extraAddressInfo || ''}` : "N/A"}
                            </td> */}
                            <td>{sac.clientId || "S/N"}</td>
                            <td className={styles.ellipsisCell}>{client.holderName || "N/A"}</td>
                            <td>{formattedDate}</td>
                            <td className={styles.actionsCell}>
                                <div className={styles.buttonGroup}>
                                {customerServiceOrders.length > 0 ? (
                                    <button
                                        className={`${styles.buttonBase} ${styles.viewClaimButton}`}
                                        onClick={() => handleViewOac(sac)}
                                    >
                                        Ver O.A.Cs
                                    </button>
                                ) : (
                                    <button
                                        className={`${styles.buttonBase} ${styles.generateOacButton}`}
                                        onClick={() => handleOpenOacForm(sac)}
                                    >
                                        O.A.C 📄
                                    </button>
                                )}
                                <button
                                    className={`${styles.buttonBase} ${styles.viewReclamoButton}`}
                                    onClick={() => handleViewSac(sac)}
                                >
                                    Ver Reclamo
                                </button>
                                </div>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>


                    {/* Pagination */}
                    <div className={styles.paginationContainer}>
                        <Pagination
                            count={Math.ceil(total / sacsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </div>
                    {showOacModal && selectedSac && (
                        <OacModal sac={selectedSac} onClose={handleCloseOacModal} showStatusButton={true} />  
                    )}
                    {isOacFormOpen && oacFormSac && (
                        <OacForm
                            sac={oacFormSac}
                            client={clients[oacFormSac.clientId]}
                            onClose={handleCloseOacForm}
                            mode="create"
                        />
                    )}
                    {showSac && (
                    <Sac sac={selectedSac} onClose={handleCloseSac} />
                    )}
                </div>
            )}
        </div>
    );
};

export default OngoingClaimsTable;
