import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ actions, onSelectAction, defaultAction,admin }) => {
    const [selectedAction, setSelectedAction] = useState(defaultAction?.label || null);

    useEffect(() => {
        if (defaultAction) {
            setSelectedAction(defaultAction.label);
        }
    }, [defaultAction]);

    const handleActionClick = (action) => {
        setSelectedAction(action.label);
        onSelectAction(action);
    };

    return (
        <div className={admin ? styles.sidebarAdmin : styles.sidebar}>
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
