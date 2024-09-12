import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Pagination, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AiOutlineSearch, AiOutlineSync, AiOutlineLoading3Quarters, AiOutlineFilePdf } from 'react-icons/ai';
import { fetchSACs } from '../../redux/slices/sacsSlice';
import styles from './SacTable.module.css';
import SacPDF from '../SacPDF/SacPDF';

const SacTable = () => {
    const dispatch = useDispatch();
    const { sacs, status, error, total } = useSelector((state) => state.sacs);

    const [currentPage, setCurrentPage] = useState(1);
    const [sacIdSearch, setSacIdSearch] = useState('');
    const [clientIdSearch, setClientIdSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const sacsPerPage = 10;
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    useEffect(() => {
        if (!isRefreshing) {
            dispatch(fetchSACs({
                page: currentPage,
                limit: sacsPerPage,
                sacId: searchParams.sacId,
                clientId: searchParams.clientId,
                status:  statusFilter ? statusMap[statusFilter] : '',
                priority: priorityFilter
            }));
        }
    }, [dispatch, currentPage, statusFilter, priorityFilter, sacsPerPage, searchParams, isRefreshing]);

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
            }, 1000);
        }
    };



    const handleStatusChange = (e) => {
        setSearchParams({
            sacId: '',
            clientId: ''
        });
        setClientIdSearch('');
        setSacIdSearch('');
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePriorityChange = (e) => {
        setSearchParams({
            sacId: '',
            clientId: ''
        });
        setClientIdSearch('');
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

    const handleGeneratePDF = (sacId) => {
        SacPDF(sacId); 
    };

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
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="En Curso">En Curso</MenuItem>
                        <MenuItem value="Cerrado">Cerrado</MenuItem>
                    </Select>
                </FormControl>

                {/* Prioridad Filter */}
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
                {/* Reset Button */}
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
                    label="Buscar por Número de Cliente"
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

            {/* SAC Table */}
            {status === 'succeeded' && sacs?.length > 0 && (
                <div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Número de SAC</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Numero de Cuenta</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sacs.map((sac) => (
                            <tr key={sac.id} className={`
                                ${sac.priority === 'alta' ? styles.highPriorityRow : ''}
                                ${sac.priority === 'media' ? styles.mediumPriorityRow : ''}
                                ${sac.priority === 'baja' ? styles.lowPriorityRow : ''}
                            `}>
                                    <td>{sac.id}</td>
                                    <td>
                                        <div className={styles.statusContainer}>
                                            <span className={`${styles.statusCircle} ${styles[mapStatusToClass(sac.status)]}`}></span>
                                            {mapStatusToSpanish(sac.status)}
                                        </div>
                                    </td>
                                    <td>{capitalizePriority(sac.priority)}</td>
                                    <td>{sac.clientId}</td>
                                    <td>
                                    <AiOutlineFilePdf
                                        className={styles.pdfIcon} 
                                        onClick={() => handleGeneratePDF(sac.id)} 
                                        title="Descargar PDF"
                                        size={24} 
                                        style={{ cursor: 'pointer' }} 
                                    />
                                    </td>
                                </tr>
                            ))}
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
                </div>
            )}
        </div>
    );
};

export default SacTable;
