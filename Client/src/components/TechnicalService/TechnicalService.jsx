import React, { useState } from 'react';
import styles from './TechnicalService.module.css';
import TechnicalServiceTable from '../TechnicalServiceTable/TechnicalServiceTable.jsx';


const TechnicalService= () => {
    const [activeTab, setActiveTab] = useState('technicalService'); 


    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'technicalService' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('technicalService')}
                >
                    <h2>Servicio Tecnico</h2>
                </div>

            </div>

            {activeTab === 'technicalService' && (
                <div className={styles.technicalServiceTab}>
                    <TechnicalServiceTable />
                </div>
            )}
        </div>
    );
};

export default TechnicalService;