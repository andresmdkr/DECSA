import React, { useState } from 'react';
import styles from './OperationalAgent.module.css';
import OperationalAgentTable from '../OperationalAgentTable/OperationalAgentTable.jsx';


const OperationalAgent = () => {
  const [activeTab, setActiveTab] = useState('operationalAgent');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${activeTab === 'operationalAgent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('operationalAgent')}
        >
          <h2>Agentes Operativos</h2>
        </div>
      </div>

      {activeTab === 'operationalAgent' && (
        <div className={styles.operationalAgentTab}>
          <OperationalAgentTable />
        </div>
      )}
    </div>
  );
};

export default OperationalAgent;