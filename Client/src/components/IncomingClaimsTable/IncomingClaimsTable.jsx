import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pagination, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AiOutlineSync, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { fetchSACs, updateSAC } from '../../redux/slices/sacsSlice';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice.js';
import styles from './IncomingClaimsTable.module.css';
import OacForm from '../OacForm/OacForm';
import Sac from '../Sac/Sac.jsx';

const IncomingClaimsTable = () => {
    const dispatch = useDispatch();
    const { sacs, status, error, total } = useSelector((state) => state.sacs);

    const [currentPage, setCurrentPage] = useState(1);
    const [priorityFilter, setPriorityFilter] = useState('');
    const sacsPerPage = 20;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isOacFormOpen, setOacFormOpen] = useState(false);
    const [selectedSac, setSelectedSac] = useState(null);
    const [formMode, setFormMode] = useState('create'); 
    const [showSac, setShowSac] = useState(false); 
    const [clients, setClients] = useState({}); 

    useEffect(() => {
        if (!isRefreshing) {
            dispatch(fetchSACs({
                page: currentPage,
                limit: sacsPerPage,
                priority: priorityFilter,
                area: 'operaciones',
                status: 'Pending',
            }));
        }
    }, [dispatch, currentPage, priorityFilter, sacsPerPage, isRefreshing]);

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

    const capitalizeText = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handlePriorityChange = (e) => {
        setPriorityFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            setPriorityFilter('');
            setCurrentPage(1);

            setTimeout(() => {
                setIsRefreshing(false);
            }, 300);
        }
    };

    const handleClose = async () => {
        dispatch(fetchSACs({
            page: currentPage,
            limit: sacsPerPage,
            priority: priorityFilter,
            area: 'operaciones',
            status: 'Pending',
        }));
        handleReset();
        setShowSac(false);
    };
    

    const handleActionClick = (sac, mode = 'create') => {
        setSelectedSac(sac); 
        setFormMode(mode); 
        setOacFormOpen(true); 
    };

    

    const handleCloseForm = () => {
        setOacFormOpen(false); 
        setSelectedSac(null);
    };

    const mapStatusToClass = (status) => {
        const statusClasses = {
            Pending: 'statusPending',
            Open: 'statusOpen',
            Closed: 'statusClosed',
        };
        return statusClasses[status] || 'statusDefault';
    };

    const handleViewSac = async (sac) => {
        setSelectedSac(sac);
        try {
            setShowSac(true);
        } catch (error) {
            console.error("Error al actualizar SAC:", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <FormControl variant="outlined" className={styles.filter}>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                        value={priorityFilter}
                        onChange={handlePriorityChange}
                        label="Prioridad"
                    >
                        <MenuItem value=""><em>Ninguna</em></MenuItem>
                        <MenuItem value="alta">Alta</MenuItem>
                        <MenuItem value="media">Media</MenuItem>
                        <MenuItem value="baja">Baja</MenuItem>
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

            {status === 'loading' && (
                <div className={styles.loadingSpinner}>
                    <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                    <span>Cargando SACs...</span>
                </div>
            )}

            {status === 'failed' && <p className={styles.error}>Error: {error}</p>}

            {status === 'succeeded' && sacs.length === 0 && <p>No hay SACs pendientes.</p>}

            {status === 'succeeded' && sacs?.length > 0 && (
                <div>
         <table className={styles.table}>
            <thead>
                <tr>
                <th>SAC</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Motivo</th>
                <th>Responsable</th>
                <th>Nombre Titular</th>
                <th>Dirección</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {sacs.map((sac) => {
                const client = clients[sac.clientId] || {};
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
                        Pendiente
                        </div>
                    </td>
                    <td>{capitalizeText(sac.priority)}</td>
                    <td>{capitalizeText(sac.claimReason)}</td>
                    <td>{sac.assignedTo || 'N/A'}</td>
                    <td className={styles.ellipsisCell}>{client.holderName || 'N/A'}</td>
                    {/* <td className={styles.ellipsisCell}>
                        {client.address ? `${client.address}, ${client.extraAddressInfo || ''}` : 'N/A'}
                    </td> */}
                    <td className={styles.ellipsisCell}>
                        {client.address ? `${client.address}` : 'N/A'}
                    </td>
                    <td>
                        <button className={styles.actionButton} onClick={() => handleViewSac(sac)}>
                        Ver Reclamo
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>

                    {showSac && selectedSac && (
                        <Sac sac={selectedSac} onClose={handleClose} />
                    )}
                    <div className={styles.paginationContainer}>
                        <Pagination
                            count={Math.ceil(total / sacsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </div>
                </div>
            )}

            {isOacFormOpen && (
                <OacForm
                sac={selectedSac}
                onClose={handleCloseForm}
                mode={formMode}
                />
            )}
        </div>
    );
};

export default IncomingClaimsTable;
