import React, { useState } from 'react';
import styles from './ClaimsOp.module.css';
import ClaimsOpTable from '../ClaimsOpTable/ClaimsOpTable.jsx';

const ClaimsOp = () => {
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
                    <ClaimsOpTable />
                </div>
            )}
        </div>
    );
};

export default ClaimsOp;
