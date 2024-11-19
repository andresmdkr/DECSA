import React, { useState } from 'react';
import styles from './OngoingClaims.module.css'; 
import OngoingClaimsTable from '../OngoingClaimsTable/OngoingClaimsTable.jsx';

const OngoingClaims = () => {
    const [activeTab, setActiveTab] = useState('ongoing'); 

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('ongoing')}
                >
                    <h2>Reclamos en Curso</h2>
                </div>
            </div>

            {activeTab === 'ongoing' && (
                <div className={styles.ongoingTab}>
                    <OngoingClaimsTable />
                </div>
            )}
        </div>
    );
};

export default OngoingClaims;
