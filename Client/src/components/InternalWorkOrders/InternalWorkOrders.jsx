import React, { useState } from 'react';
import styles from './InternalWorkOrders.module.css';
import InternalWorkOrdersTable from '../InternalWorkOrdersTable/InternalWorkOrdersTable.jsx';

const InternalWorkOrders = () => {
    const [activeTab, setActiveTab] = useState('history'); 

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <h2>Ordenes de Trabajo Internas</h2>
                </div>
            </div>

            {activeTab === 'history' && (
                <div className={styles.historyTab}>
                    <InternalWorkOrdersTable />
                </div>
            )}
        </div>
    );
};

export default InternalWorkOrders;
