import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './RepairOrderForm.module.css';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { fetchAllTechnicalServices } from '../../redux/slices/technicalServiceSlice';
import { updateRepairOrder } from '../../redux/slices/repairOrderSlice'; 
import OrPDF from '../OrPDF/OrPDF';

const RepairOrderForm = ({sacId, burnedArtifact, repairOrder, mode, onClose }) => {
    const dispatch = useDispatch();
    const technicalServices = useSelector(state => state.technicalService.technicalServices);

    const [technicalService, setTechnicalService] = useState(null);
    const [budget, setBudget] = useState('');
    const [technicalReport, setTechnicalReport] = useState('');

    useEffect(() => {
        if (mode === 'edit' || mode === 'view') {
            if (repairOrder) {
                setTechnicalService(repairOrder.technicalService);
                setBudget(repairOrder.budget);
                setTechnicalReport(repairOrder.technicalReport);
            }
        }
    }, [mode, repairOrder]);

    useEffect(() => {
        dispatch(fetchAllTechnicalServices());
    }, [dispatch]);

    const formatNumber = (number) => {
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    
    const handleBudgetChange = (e) => {
        const input = e.target.value.replace(/[^0-9]/g, ''); 
        if (!isNaN(input)) {
            setBudget(input); 
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const formattedBudget = `${formatNumber(budget)}`;
        const repairOrderData = { 
            technicalService, 
            budget: formattedBudget, 
            technicalReport 
        };
    
        if (mode === 'edit') {
            const result = await dispatch(updateRepairOrder({ repairOrderId: repairOrder.id, repairOrderData }));
            if (result.type === 'repairOrders/updateRepairOrder/fulfilled') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualización exitosa!',
                    text: 'La orden de reparación se actualizó correctamente.',
                    confirmButtonColor: '#000f97',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al actualizar la orden de reparación.',
                });
            }
        }
    };
    

    const handlePrintClick = async () => {
        if (mode === 'edit') {
            const repairOrderData = { technicalService, budget, technicalReport };
            const result = await dispatch(updateRepairOrder({ repairOrderId: repairOrder.id, repairOrderData }));
            
            if (result.type === 'repairOrders/updateRepairOrder/fulfilled') {
                console.log('Repair order updated successfully');
                const selectedTechnicalService = technicalServices.find(service => service.name === technicalService);
    
                if (selectedTechnicalService) {
                    OrPDF({
                        sacId,
                        burnedArtifact,
                        technicalService: selectedTechnicalService,
                        repairOrder: { ...repairOrder,technicalReport, budget },  
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Servicio técnico no encontrado.',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al actualizar la orden de reparación.',
                });
            }
        } else {
            const selectedTechnicalService = technicalServices.find(service => service.name === technicalService);
            if (selectedTechnicalService) {
                OrPDF({
                    sacId,
                    burnedArtifact,
                    technicalService: selectedTechnicalService,
                    repairOrder: { ...repairOrder,technicalReport, budget }, 
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Servicio técnico no encontrado.',
                });
            }
        }
    };
    
    

    const customSelectStyles = {
        container: (provided) => ({
            ...provided,
            width: '100%',
        }),
        menu: (provided) => ({
            ...provided,
            maxHeight: '150px',
            overflowY: 'auto',
        }),
    };

    const isReadOnly = mode === 'view';

    return (
        <div className={styles.repairOrderModalOverlay}>
            <div className={styles.repairOrderModalContent}>
                <button className={styles.repairOrderCloseButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.repairOrderTitle}>
                    {mode === 'edit' ? `Orden de Reparación #${repairOrder.id}` : `Orden de Reparación #${repairOrder.id} (CERRADA)`}
                </h2>

                <form className={styles.repairOrderForm} onSubmit={handleFormSubmit}>
                    <div className={styles.inlineGroup}>
                        <label className={styles.repairOrderLabel}>Servicio Técnico:</label>
                        <Select
                            options={technicalServices.map(service => ({
                                value: service.name,
                                label: service.name,
                            }))}
                            value={technicalService ? { value: technicalService, label: technicalService } : null}
                            onChange={(selectedOption) => setTechnicalService(selectedOption.value)}
                            styles={customSelectStyles}
                            isDisabled={isReadOnly}
                            placeholder="Seleccionar servicio técnico"
                        />
                    </div>

                    <div className={styles.inlineGroup}>
                        <label className={styles.repairOrderLabel}>Presupuesto:</label>
                        <input
                            type="text"
                            value={budget ? `$ ${formatNumber(budget)}` : '$ '}
                            onChange={handleBudgetChange}
                            disabled={isReadOnly}
                            placeholder="Ingresar presupuesto"
                            className={styles.repairOrderInput}
                        />
                    </div>

                    <div className={styles.repairOrderTextareaGroup}>
                        <label className={styles.repairOrderLabel}>Informe Técnico:</label>
                        <textarea
                            value={technicalReport}
                            onChange={(e) => setTechnicalReport(e.target.value)}
                            placeholder="Redactar informe técnico..."
                            readOnly={isReadOnly}
                            className={styles.repairOrderTextarea}
                        />
                    </div>

                    {!isReadOnly && (
                        <div className={`${styles.repairOrderButtonContainer} ${mode !== 'edit' ? styles.singleButton : ''}`}>
                            {mode !== 'create' && (
                                <button className={styles.submitButton} type="button" onClick={handlePrintClick}>
                                    Imprimir O.Reparacion
                                </button>
                            )}
                            <button className={styles.submitButton} type="submit">
                                {mode === 'create' ? 'Crear Orden de Reparación' : 'Grabar'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RepairOrderForm;
