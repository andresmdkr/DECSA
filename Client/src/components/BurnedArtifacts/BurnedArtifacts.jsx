import React, { useState } from 'react';
import styles from './BurnedArtifacts.module.css';
import ArtifactTable from '../ArtifactTable/ArtifactTable.jsx';

const BurnedArtifacts = () => {
    const [activeTab, setActiveTab] = useState('history'); 


    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <h2>Artefactos Quemados</h2>
                </div>

            </div>

            {activeTab === 'history' && (
                <div className={styles.historyTab}>
                    <ArtifactTable />
                </div>
            )}
        </div>
    );
};

export default BurnedArtifacts;
