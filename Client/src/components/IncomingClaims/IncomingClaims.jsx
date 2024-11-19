import React, { useState } from 'react';
import styles from './IncomingClaims.module.css'; 
import IncomingClaimsTable from '../IncomingClaimsTable/IncomingClaimsTable.jsx';

const IncomingClaims = () => {
    const [activeTab, setActiveTab] = useState('incoming'); 

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'incoming' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('incoming')}
                >
                    <h2>Reclamos Entrantes</h2>
                </div>
            </div>

            {activeTab === 'incoming' && (
                <div className={styles.incomingTab}>
                    <IncomingClaimsTable />
                </div>
            )}
        </div>
    );
};

export default IncomingClaims;
