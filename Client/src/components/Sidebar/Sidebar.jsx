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
    const specialAction = actions.find(action => action.label === "S.A.Cs por O.T.I");
    const mainActions = actions.filter(action => action.label !== "S.A.Cs por O.T.I");

    return (
        <div className={admin ? styles.sidebarAdmin : styles.sidebar}>
            <ul>
            {mainActions.map((action, index) => (
                    <li
                        key={index}
                        className={`${styles.actionItem} ${selectedAction === action.label ? styles.active : ''}`}
                        onClick={() => handleActionClick(action)}
                    >
                        {action.label}
                    </li>
                ))}
            </ul>
            {specialAction && (
                <ul className={styles.bottomAction}>
                    <li
                        className={`${styles.actionItem2} ${selectedAction === specialAction.label ? styles.active : ''}`}
                        onClick={() => handleActionClick(specialAction)}
                    >
                        {specialAction.label}
                    </li>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;
