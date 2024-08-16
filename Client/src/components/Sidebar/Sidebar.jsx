import React, { useState } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ actions, onSelectAction }) => {
    const [selectedAction, setSelectedAction] = useState(null);

    const handleActionClick = (action) => {
        setSelectedAction(action.label);
        onSelectAction(action);
    };

    return (
        <div className={styles.sidebar}>
            <ul>
                {actions.map((action, index) => (
                    <li
                        key={index}
                        className={`${styles.actionItem} ${selectedAction === action.label ? styles.active : ''}`}
                        onClick={() => handleActionClick(action)}
                    >
                        {action.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
