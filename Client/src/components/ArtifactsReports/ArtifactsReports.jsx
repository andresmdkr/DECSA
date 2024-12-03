import React, { useState, useEffect } from 'react';
import styles from './ArtifactsReports.module.css';
import ArtifactReportPDF from '../ArtifactReportPDF/ArtifactReportPDF.js';
import ArtifactReportXLSX from '../ArtifactReportXLSX/ArtifactReportXLSX.js';

const ArtifactsReports = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

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

  const handleGenerateReport = () => {
    if (!error) {
      ArtifactReportPDF(startDate, endDate);
    }
  };

  const handleGenerateReportXLS = () => {
    if (!error) {
      ArtifactReportXLSX(startDate, endDate);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <h2>Generar Reporte</h2>
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
    </div>
  );
};

export default ArtifactsReports;
