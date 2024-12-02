import React, { useState } from 'react';
import styles from './ArtifactsReports.module.css';
import ArtifactReportPDF from '../ArtifactReportPDF/ArtifactReportPDF.js'

const ArtifactsReports = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateReport = () => {
    ArtifactReportPDF(startDate, endDate);
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
          {startDate && endDate && (
            <button
              onClick={handleGenerateReport}
              className={styles.generateButton}
            >
              Generar Reporte
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactsReports;
