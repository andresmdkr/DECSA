import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './CustomerDetails.module.css';
import { AiOutlineEdit, AiOutlineCheck } from 'react-icons/ai';
import { updateClientByAccountNumber } from '../../redux/slices/clientsSlice';

const CustomerDetails = ({ client, onClose }) => {
    const dispatch = useDispatch();
    const [editableFields, setEditableFields] = useState({});

    const handleInputChange = (field, value) => {
        setEditableFields({
            ...editableFields,
            [field]: value,
        });
    };

    const handleEditClick = (field) => {
        setEditableFields({
            ...editableFields,
            [field]: client[field],
        });
    };

    const handleSaveClick = async (field) => {
        try {
            await dispatch(updateClientByAccountNumber({
                accountNumber: client.accountNumber,
                data: { [field]: editableFields[field] }
            }));
            setEditableFields((prevState) => ({
                ...prevState,
                [field]: undefined,
            }));
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
        }
    };

    const renderEditableField = (field, label, additionalField = null) => {
        const isFieldEditing = editableFields[field] !== undefined;

        return (
            <div className={styles.fieldGroup}>
                <label>{label}:</label>
                <div className={styles.fieldWrapper}>
                    <input
                        type="text"
                        value={editableFields[field] || client[field] || ''}
                        disabled={!isFieldEditing}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className={styles.inputField}
                    />
                    {!isFieldEditing ? (
                        <AiOutlineEdit
                            className={styles.editIcon}
                            onClick={() => handleEditClick(field)}
                        />
                    ) : (
                        <AiOutlineCheck
                            className={styles.saveIcon}
                            onClick={() => handleSaveClick(field)}
                        />
                    )}
                </div>
                {additionalField && renderEditableField(additionalField.field, additionalField.label)}
            </div>
        );
    };

    return (
        <div className={styles.detailsContainer}>
            <div className={styles.modalContent}>
                <h2>Detalles del Cliente</h2>
                <div className={styles.scrollableContent}>
                    {renderEditableField('accountNumber', 'Número de Cuenta')}
                    {renderEditableField('holderName', 'Nombre Titular')}
                    {renderEditableField('address', 'Dirección', { field: 'extraAddressInfo', label: 'Información Adicional Dirección' })}
                    {renderEditableField('postalAddress', 'Dirección Postal', { field: 'extraPostalAddressInfo', label: 'Información Adicional Postal' })}
                    {renderEditableField('category', 'Categoría')}
                    {renderEditableField('device', 'Dispositivo')}
                    {renderEditableField('status', 'Estado')}
                    {renderEditableField('voltage', 'Voltaje')}
                    {renderEditableField('locality', 'Localidad')}
                    {renderEditableField('department', 'Departamento')}
                    {renderEditableField('province', 'Provincia')}
                    {renderEditableField('substation', 'SETA')}
                    {renderEditableField('distributor', 'Distribuidora')}
                </div>
                <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
            </div>
        </div>
    );
};

export default CustomerDetails;
