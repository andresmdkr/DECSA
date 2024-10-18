import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Pagination, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AiOutlineSearch, AiOutlineSync, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { fetchAllArtifacts } from '../../redux/slices/artifactsSlice';
import styles from './ArtifactTable.module.css';
import Artifact from '../Artifact/Artifact';

const ArtifactTable = () => {
    const dispatch = useDispatch();
    const { status, error, totalPages } = useSelector((state) => state.artifacts);

    const [currentPage, setCurrentPage] = useState(1);
    const [sacIdSearch, setSacIdSearch] = useState('');
    const [clientIdSearch, setClientIdSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const artifactsPerPage = 10;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [artifactList, setArtifactList] = useState([]);

    const [searchParams, setSearchParams] = useState({
        artifactId: '',
        clientId: '',
    });

    useEffect(() => {
        if (!isRefreshing) {
            dispatch(fetchAllArtifacts({
                page: currentPage,
                limit: artifactsPerPage,
                sacId: searchParams.sacId,
                clientId: searchParams.clientId,
                status: statusFilter
            })).then((response) => {
                setArtifactList(response.payload.artifacts); 
            });
            console.log(artifactList);
        }
    }, [dispatch, currentPage, statusFilter, artifactsPerPage, searchParams, isRefreshing]);
    

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
            setCurrentPage(1);

            setSearchParams({
                artifactId: '',
                clientId: ''
            });

            setTimeout(() => {
                setIsRefreshing(false);
            }, 300);
        }
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

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
    
        // Validar si el valor es un número
        if (!isNaN(value)) {
            setClientIdSearch('');
            setSacIdSearch(value);
        } else {
            // Si no es un número, limpiamos el campo
            setSacIdSearch('');
        }
    };
    

    const handleClientIdInputChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value)) {
            setSacIdSearch('');
            setClientIdSearch(value);
        } else {
            setClientIdSearch('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if(sacIdSearch || clientIdSearch || statusFilter){
                handleSearch();
            }else{
                handleReset();
            }
        }
    };

 
    const handleViewArtifact = (artifact) => {
        setSelectedArtifact(artifact);
        setIsArtifactModalOpen(true);
    };

    const handleCloseArtifactModal = () => {
        setIsArtifactModalOpen(false);
        setSelectedArtifact(null);
    };

    const handleArtifactUpdate = (artifactId, newStatus) => {
   
        setArtifactList(prevArtifacts =>
            prevArtifacts.map(artifact =>
                artifact.id === artifactId
                    ? { ...artifact, status: newStatus }
                    : artifact
            )
        );
    };

    return (
        <div className={styles.container}>

            <div className={styles.filterContainer}>

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
                            <MenuItem value="In Progress">En Curso</MenuItem>
                            <MenuItem value="Completed">Cerrado</MenuItem>
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

            {status === 'loading' && (
                <div className={styles.loadingSpinner}>
                    <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                    <span>Cargando Artefactos...</span>
                </div>
            )}


            {status === 'failed' && <p>Error: {error}</p>}


            {status === 'succeeded' && artifactList.length === 0 && <p>No hay artefactos disponibles.</p>}

            {status === 'succeeded' && artifactList?.length > 0 && (
                <div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Artefacto </th>
                                <th>Estado</th>
                                <th>Número de SAC</th>
                                <th>Numero de Cuenta</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artifactList.map((artifact) => (
                                <tr key={artifact.id}>
                                    <td>{`${artifact.name} / ${artifact.brand} / ${artifact.model}`}</td>
                                    <td>
                                        <span className={`${styles.statusCircle} ${
                                            artifact.status === 'Pending' ? styles.red : 
                                            artifact.status === 'In Progress' ? styles.orange : 
                                            styles.green
                                        }`} />
                                        {artifact.status === 'Pending' && 'Pendiente'}
                                        {artifact.status === 'In Progress' && 'En Curso'}
                                        {artifact.status === 'Completed' && 'Cerrado'}
                                    </td>
                                    <td>{artifact.sacId}</td>
                                    <td>{artifact.clientId}</td>
                                    <td>
                                        <button 
                                            className={styles.viewArtifactButton} 
                                            onClick={() => handleViewArtifact(artifact)}
                                        >
                                            Ver Artefacto
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    

                    <div className={styles.paginationContainer}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </div>
                </div>
            )}

            {isArtifactModalOpen && selectedArtifact && (
                <Artifact 
                    sacId={selectedArtifact.sacId} 
                    artifactId={selectedArtifact.id} 
                    onUpdate={handleArtifactUpdate} 
                    onClose={handleCloseArtifactModal}
                    mode={selectedArtifact.status !== 'Completed' ? 'edit' : 'view'} 
                />  
            )}
        </div>
    );
};

export default ArtifactTable;
