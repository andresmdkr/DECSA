import React, { useState } from 'react';
import styles from './Users.module.css';
import UserTable from '../UserTable/UserTable.jsx'; 


const Users= () => {
    const [activeTab, setActiveTab] = useState('users'); 


    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <h2>Usuarios</h2>
                </div>

            </div>

            {activeTab === 'users' && (
                <div className={styles.container2}>
                  <UserTable /> 
                </div>
            )}
        </div>
    );
};

export default Users;