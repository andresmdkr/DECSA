import React, { useState } from 'react';
import styles from './Claims.module.css';
import ClaimsTable from '../ClaimsTable/ClaimsTable.jsx';

const Claims = () => {
    const [activeTab, setActiveTab] = useState('history'); 


    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <h2>Historial Reclamos</h2>
                </div>

            </div>

            {activeTab === 'history' && (
                <div className={styles.historyTab}>
                    <ClaimsTable />
                </div>
            )}
        </div>
    );
};

export default Claims;
