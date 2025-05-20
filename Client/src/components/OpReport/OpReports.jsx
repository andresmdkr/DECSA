import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineSearch } from 'react-icons/ai';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import styles from './OpReports.module.css';
import OpReportPDF from '../OpReportPDF/OpReportPDF.js';
import OpReportXLSX from '../OpReportXLSX/OpReportXLSX.js';
import { fetchClientByAccountNumber } from '../../redux/slices/clientsSlice.js';
import Loader from '../Loader/Loader.jsx';

const OpReports = () => {
  const dispatch = useDispatch();
  const { client, status, error: clientError } = useSelector((state) => state.clients);

  const [activeTab, setActiveTab] = useState('reports');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const [startDateUser, setStartDateUser] = useState('');
  const [endDateUser, setEndDateUser] = useState('');
  const [errorUser, setErrorUser] = useState('');
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [userExists, setUserExists] = useState(null);

  const [setaSearchTerm, setSetaSearchTerm] = useState('');
const [startDateSeta, setStartDateSeta] = useState('');
const [endDateSeta, setEndDateSeta] = useState('');
const [errorSeta, setErrorSeta] = useState('');

  const [isLoading, setIsLoading] = useState(false); 


  // Validar las fechas en cada cambio
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        setError('La fecha final debe ser mayor que la fecha inicial.');
      } else {
        setError('');
      }
    } else {
      setError(''); // Resetear el error si faltan fechas
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDateUser && endDateUser) {
      if (new Date(startDateUser) >= new Date(endDateUser)) {
        setErrorUser('La fecha final debe ser mayor que la fecha inicial.');
      } else {
        setErrorUser('');
      }
    } else {
      setErrorUser(''); // Resetear el error si faltan fechas
    }
  }, [startDateUser, endDateUser]);

  useEffect(() => {
    if (accountSearchTerm.trim() !== '') {
      dispatch(fetchClientByAccountNumber(accountSearchTerm));
    } else {
      setUserExists(null);
    }
  }, [accountSearchTerm, dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && client) {
      setUserExists(true);
    } else if (status === 'failed') {
      setUserExists(false);
    }
  }, [status, client]);


  useEffect(() => {
    if (startDateSeta && endDateSeta) {
      if (new Date(startDateSeta) >= new Date(endDateSeta)) {
        setErrorSeta('La fecha final debe ser mayor que la fecha inicial.');
      } else {
        setErrorSeta('');
      }
    } else {
      setErrorSeta('');
    }
  }, [startDateSeta, endDateSeta]);

  const handleGenerateReport = () => {
    if (!error) {
        setIsLoading(true);
        OpReportPDF(startDate, endDate)
            .finally(() => setIsLoading(false)); 
    }
};

  const handleGenerateReportXLS = () => {
    if (!error) {
      setIsLoading(true);
      OpReportXLSX(startDate, endDate)
        .finally(() => setIsLoading(false));
    }
  };

  const handleGenerateUserReport = () => {
    if (!errorUser && accountSearchTerm) {
      setIsLoading(true);
      OpReportPDF(startDateUser, endDateUser, accountSearchTerm)
      .finally(() => setIsLoading(false)); 
    }
  };

  const handleGenerateUserReportXLS = () => {
    if (!errorUser && accountSearchTerm) {
      OpReportXLSX(startDateUser, endDateUser, accountSearchTerm)
      .finally(() => setIsLoading(false)); 
    }
  };

  const handleGenerateSetaReport = () => {
    if (!errorSeta && setaSearchTerm.trim() !== '') {
      setIsLoading(true);
      OpReportPDF(startDateSeta, endDateSeta, null, setaSearchTerm)
        .finally(() => setIsLoading(false));
    }
  };

  const handleGenerateSetaReportXLS = () => {
    if (!errorSeta && setaSearchTerm.trim() !== '') {
      setIsLoading(true);
      OpReportXLSX(startDateSeta, endDateSeta, null, setaSearchTerm)
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (status === 'failed' && clientError === 'Client not found') {
      setSearchError('Usuario no encontrado. Verifica el número de cuenta.');
    } else {
      setSearchError('');
    }
  }, [status, clientError]);

  return (
    <div className={styles.container}>
      {isLoading && <Loader />}
      <div className={styles.tabs}>
  <div
    className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
    onClick={() => setActiveTab('reports')}
  >
    <h2>Generar Reporte</h2>
  </div>
  <div
    className={`${styles.tab} ${activeTab === 'userReports' ? styles.activeTab : ''}`}
    onClick={() => setActiveTab('userReports')}
  >
    <h2>Reporte (Usuario)</h2>
  </div>
  <div
    className={`${styles.tab} ${activeTab === 'setaReports' ? styles.activeTab : ''}`}
    onClick={() => setActiveTab('setaReports')}
  >
    <h2>Reporte (S.E.T.A)</h2>
  </div>
</div>


      {activeTab === 'reports' && (
        <div className={styles.reportsTab}>
          <div className={styles.inputGroup}>
            <label htmlFor="startDate">Fecha Inicial:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="endDate">Fecha Final:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {startDate && endDate && !error && (
            <>
              <button
                onClick={handleGenerateReport}
                className={styles.generateButton}
              >
                Generar Reporte (PDF)
              </button>
              <button
                onClick={handleGenerateReportXLS}
                className={styles.generateButton}
              >
                Generar Reporte (XLSX)
              </button>
            </>
          )}
          
        </div>
      )}
     {/* TAB 2: Reportes de Usuario */}
     {activeTab === 'userReports' && (
        <div className={styles.reportsTab}>
          {/* Ingresar Número de Cuenta */}
          <div className={styles.inputGroup}>
            <label>Número de Cuenta:</label>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Ingrese el número de cuenta"
                value={accountSearchTerm}
                onChange={(e) => setAccountSearchTerm(e.target.value)}
                maxLength="200"
                className={styles.dateInput}
              />
              {userExists === true &&<span> <AiOutlineCheckCircle className={styles.successIcon} /></span>}
              {userExists === false && <AiOutlineCloseCircle className={styles.errorIcon} />}
            </div>
          </div>

          {/* Fechas */}
          <div className={styles.inputGroup}>
            <label>Fecha Inicial:</label>
            <input type="date" value={startDateUser} onChange={(e) => setStartDateUser(e.target.value)} className={styles.dateInput} />
          </div>
          <div className={styles.inputGroup}>
            <label>Fecha Final:</label>
            <input type="date" value={endDateUser} onChange={(e) => setEndDateUser(e.target.value)} className={styles.dateInput} />
          </div>
          {errorUser && <p className={styles.error}>{errorUser}</p>}

          {/* Generar Reporte */}
          {startDateUser && endDateUser && userExists && !errorUser && (
            <>
              <button onClick={handleGenerateUserReport} className={styles.generateButton}>Generar Reporte Usuario (PDF)</button>
              <button onClick={handleGenerateUserReportXLS} className={styles.generateButton}>Generar Reporte Usuario (XLSX)</button>
            </>
          )}
        </div>
      )}
      {activeTab === 'setaReports' && (
  <div className={styles.reportsTab}>
    {/* Ingresar SETA */}
    <div className={styles.inputGroup}>
      <label>S.E.T.A:</label>
      <input
        type="text"
        placeholder="Ingrese la SETA"
        value={setaSearchTerm}
        onChange={(e) => setSetaSearchTerm(e.target.value)}
        className={styles.dateInput}
      />
    </div>

    {/* Fechas */}
    <div className={styles.inputGroup}>
      <label>Fecha Inicial:</label>
      <input
        type="date"
        value={startDateSeta}
        onChange={(e) => setStartDateSeta(e.target.value)}
        className={styles.dateInput}
      />
    </div>
    <div className={styles.inputGroup}>
      <label>Fecha Final:</label>
      <input
        type="date"
        value={endDateSeta}
        onChange={(e) => setEndDateSeta(e.target.value)}
        className={styles.dateInput}
      />
    </div>
    {errorSeta && <p className={styles.error}>{errorSeta}</p>}

    {/* Generar Reporte */}
    {startDateSeta && endDateSeta && setaSearchTerm.trim() !== '' && !errorSeta && (
      <>
        <button onClick={handleGenerateSetaReport} className={styles.generateButton}>
          Generar Reporte S.E.T.A (PDF)
        </button>
        <button onClick={handleGenerateSetaReportXLS} className={styles.generateButton}>
          Generar Reporte S.E.T.A (XLSX)
        </button>
      </>
    )}
  </div>
)}

    </div>
  );
};

export default OpReports;
