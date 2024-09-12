import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './CustomerDetails.module.css';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { updateClientByAccountNumber } from '../../redux/slices/clientsSlice';

const CustomerDetails = ({ client, onClose }) => {
  const dispatch = useDispatch();
  const [editableFields, setEditableFields] = useState({});
  const inputRefs = useRef({});
  
  // Referencia para saber qué campo está siendo editado actualmente
  const editingFieldRef = useRef(null);

  const handleInputChange = (field, value) => {
    setEditableFields({
      ...editableFields,
      [field]: value,
    });
  };

  const handleEditClick = (field) => {
    setEditableFields({
      ...editableFields,
      [field]: client[field] || '',
    });
    editingFieldRef.current = field;  // Guardamos qué campo está siendo editado
    setTimeout(() => {
      if (inputRefs.current[field]) {
        inputRefs.current[field].focus();
      }
    }, 0);
  };

  const handleSaveClick = async (field) => {
    try {
      await dispatch(
        updateClientByAccountNumber({
          accountNumber: client.accountNumber,
          data: { [field]: editableFields[field] },
        })
      );
      setEditableFields((prevState) => ({
        ...prevState,
        [field]: undefined,
      }));
      editingFieldRef.current = null; // Reiniciamos la referencia del campo editado
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
    }
  };

  const handleKeyDown = (event, field) => {
    if (event.key === 'Enter') {
      handleSaveClick(field);
    }
  };

  // Detectar clics fuera del input
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si hay un campo en edición y el clic no es dentro del input o el icono de edición
      if (
        editingFieldRef.current &&
        inputRefs.current[editingFieldRef.current] &&
        !inputRefs.current[editingFieldRef.current].contains(event.target)
      ) {
        handleSaveClick(editingFieldRef.current);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editableFields]);

  const renderEditableField = (field, label) => {
    const isFieldEditing = editableFields[field] !== undefined;

    return (
      <div className={styles.fieldGroup}>
        <label className={styles.boldLabel}>{label}:</label>
        <div className={styles.fieldWrapper}>
          <input
            ref={(el) => (inputRefs.current[field] = el)}
            type="text"
            value={
              editableFields[field] !== undefined
                ? editableFields[field]
                : client[field] || ''
            }
            disabled={!isFieldEditing}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, field)}
            className={`${styles.inputField} ${
              isFieldEditing ? styles.editable : styles.readOnly
            }`}
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
      </div>
    );
  };
  
  return (
    <div className={styles.detailsContainer}>
      <div className={styles.modalContent}>
        <AiOutlineClose  className={styles.closeIcon} onClick={onClose} />
        <h2 className={styles.modalTitle}>Detalles del Cliente</h2>
        <div className={styles.scrollableContent}>
          {/* Sección de Datos Personales */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Datos Personales</legend>
            <div className={styles.section}>
              {renderEditableField('accountNumber', 'Número de Cuenta')}
              {renderEditableField('holderNumber', 'Número del Titular')}
              {renderEditableField('holderName', 'Nombre del Titular')}
              {renderEditableField('dni', 'DNI')}
              {renderEditableField('phone', 'Telefono')}
              {renderEditableField('auxPhone', 'Telefono Axuliar')}
              
            </div>
            <hr className={styles.sectionSeparator} />
            <div className={styles.section}>
              {renderEditableField('address', 'Dirección')}
              {renderEditableField('extraAddressInfo', 'Info. Adicional Dirección')}
              {renderEditableField('postalAddress', 'Dirección Postal')}
              {renderEditableField('extraPostalAddressInfo', 'Info. Adicional Postal')}
            </div>
            <hr className={styles.sectionSeparator} />
            <div className={styles.section}>
              {renderEditableField('province', 'Provincia')}
              {renderEditableField('department', 'Departamento')}
              {renderEditableField('locality', 'Localidad')}
            </div>
          </fieldset>

          {/* Sección de Datos Eléctricos */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Datos Eléctricos</legend>
           
            <div className={styles.section}>
                {renderEditableField('status', 'Estado')}
              {renderEditableField('service', 'Servicio')}
              {renderEditableField('category', 'Categoría')}
         
              {renderEditableField('voltage', 'Voltaje')}
            </div>
            
         
            <hr className={styles.sectionSeparator} />
            <div className={styles.section}>
            {renderEditableField('device', 'Numero de Medidor')}
              {renderEditableField('substation', 'Subestación SETA')}
              {renderEditableField('distributor', 'Distribuidor')}
              {renderEditableField('supply', 'Numero de Suministro')}
            </div>
            
            <hr className={styles.sectionSeparator} /> 
         <div className={styles.section}>
         {renderEditableField('wsg84Long', 'Longitud (WSG84)')}
         {renderEditableField('wsg84Lati', 'Latitud (WSG84)')}
        {renderEditableField('zone', 'Zona')}
        {renderEditableField('sector', 'Sector')}
        {renderEditableField('route', 'Ruta')}
        
      </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
