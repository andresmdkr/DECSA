import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './CustomerDetails.module.css';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { updateClientByAccountNumber } from '../../redux/slices/clientsSlice';
import Swal from 'sweetalert2';

const CustomerDetails = ({ client, onClose }) => {
  const dispatch = useDispatch();
  const [editableFields, setEditableFields] = useState({});
  const [labelText, setLabelText] = useState('');
  const inputRefs = useRef({});
  
  const editingFieldRef = useRef(null);

  const handleInputChange = (field, value) => {
    setEditableFields({
      ...editableFields,
      [field]: value,
    });
  };

  const handleEditClick = (field,label) => {
    setLabelText(label);
    setEditableFields({
      ...editableFields,
      [field]: client[field] || '',
    });
    editingFieldRef.current = field;  
    setTimeout(() => {
      if (inputRefs.current[field]) {
        inputRefs.current[field].focus();
      }
    }, 0);
  };

  const handleSaveClick = async (field) => {
   
    if (editableFields[field] === client[field]) {
      setEditableFields((prevState) => ({
        ...prevState,
        [field]: undefined,
      }));
      editingFieldRef.current = null;
      return;
    }
  
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de cambiar el campo ${labelText} con el valor ${editableFields[field]}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    });
  
    if (result.isConfirmed) {
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
        editingFieldRef.current = null;
      } catch (error) {
        console.error('Error al actualizar el cliente:', error);
      }
    } else {
      setEditableFields((prevState) => ({
        ...prevState,
        [field]: undefined,
      }));
      editingFieldRef.current = null;
    }
  };
  
  
  
  
  const handleKeyDown = async (event, field, label) => {
    setLabelText(label);
     if (event.key === 'Enter') {

      if (editableFields[field] === client[field]) {
        setEditableFields((prevState) => ({
          ...prevState,
          [field]: undefined,
        }));
        editingFieldRef.current = null;
        return;
      }
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Estás seguro de cambiar el campo ${labelText} con el valor ${editableFields[field]}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        handleSaveClick(field, label); 
      }
    }
  };
  
  
  


  useEffect(() => {
    const handleClickOutside = (event) => {
      
      if (document.querySelector('.swal2-container')?.contains(event.target)) {
        return; 
      }
  
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
  

  const renderEditableField = (field, label, isDate = false, isStatus = false, isVoltage = false) => {
    const isFieldEditing = editableFields[field] !== undefined;
    

    if (isStatus) {
      return (
        <div className={styles.fieldGroup}>
          <label className={styles.boldLabel}>{label}:</label>
          <div className={styles.fieldWrapper}>
            <select
              ref={(el) => (inputRefs.current[field] = el)}
              value={editableFields[field] !== undefined ? editableFields[field] : client[field] || ''}
              disabled={!isFieldEditing}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.inputSelect} ${isFieldEditing ? styles.editable : styles.readOnly}`}
              autoComplete="nope"
            >
              <option value="CONECTADO">CONECTADO</option>
              <option value="BAJA">BAJA</option>
              <option value="PENDIENTE_CONEXION">PENDIENTE_CONEXION</option>
            </select>
            {!isFieldEditing ? (
              <AiOutlineEdit className={styles.editIcon} onClick={() => handleEditClick(field, label)} />
            ) : (
              <AiOutlineCheck className={styles.saveIcon} onClick={() => handleSaveClick(field, label)} />
            )}
          </div>
        </div>
      );
    }

    if (isVoltage) {
      return (
        <div className={styles.fieldGroup}>
          <label className={styles.boldLabel}>{label}:</label>
          <div className={styles.fieldWrapper}>
            <select
              ref={(el) => (inputRefs.current[field] = el)}
              value={editableFields[field] !== undefined ? editableFields[field] : client[field] || ''}
              disabled={!isFieldEditing}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.inputSelect} ${isFieldEditing ? styles.editable : styles.readOnly}`}
               autoComplete="nope"
            >
              <option value="220">220</option>
              <option value="380">380</option>
              <option value="Sin Tension">Sin Tension</option>
            </select>
            {!isFieldEditing ? (
              <AiOutlineEdit className={styles.editIcon} onClick={() => handleEditClick(field, label)} />
            ) : (
              <AiOutlineCheck className={styles.saveIcon} onClick={() => handleSaveClick(field, label)} />
            )}
          </div>
        </div>
      );
    }


    return (
      <div className={styles.fieldGroup}>
        <label className={styles.boldLabel}>{label}:</label>
        <div className={styles.fieldWrapper}>
          <input
            ref={(el) => (inputRefs.current[field] = el)}
            type={isDate ? 'date' : 'text'}
            value={
              isDate
                ? (editableFields[field] !== undefined ? editableFields[field] : client[field]?.slice(0, 10))
                : (editableFields[field] !== undefined ? editableFields[field] : client[field] || '')
            }
            disabled={!isFieldEditing}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, field, label)}
            maxLength={250}
            className={`${styles.inputField} ${isFieldEditing ? styles.editable : styles.readOnly}`}
            autoComplete="nope"
          />
          {!isFieldEditing ? (
            <AiOutlineEdit className={styles.editIcon} onClick={() => handleEditClick(field, label)} />
          ) : (
            <AiOutlineCheck className={styles.saveIcon} onClick={() => handleSaveClick(field, label)} />
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
              {renderEditableField('barrio', 'Barrio')}
              {renderEditableField('province', 'Provincia')}
              {renderEditableField('department', 'Departamento')}
              {renderEditableField('locality', 'Localidad')}
            </div>
          </fieldset>

          {/* Sección de Datos Eléctricos */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Datos Eléctricos</legend>
           
            <div className={styles.section}>
              {renderEditableField('status', 'Estado', false, true)}
              {renderEditableField('service', 'Servicio')}
              {renderEditableField('category', 'Categoría')}
         
              {renderEditableField('voltage', 'Voltaje', false,false, true)}
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
            
            {/* Sección de Estado Actual */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Estado Actual</legend>
            <div className={styles.section}>
            {renderEditableField('dateOfEntry', 'Fecha de Alta', true)} 
            {renderEditableField('dateOfTermination', 'Fecha de Baja', true)} 
            </div>
            <hr className={styles.sectionSeparator} /> 
            <div className={styles.section}>
              {renderEditableField('consumption2024', 'Consumo 2024')}
            </div>
          </fieldset>

        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
