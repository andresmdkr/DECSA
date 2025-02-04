import styles from "./Admin.module.css";
import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Users from "../../components/Users/Users.jsx";




const Admin = () => {
    const actions = [
        { label: 'Usuarios App', component:Users},
    ];

    const [selectedAction, setSelectedAction] = useState(actions[0]);

    const renderContent = () => {
        if (!selectedAction) {
            return <div className={styles.defaultMessage}>Selecciona una acción de la barra lateral</div>;
        }
        const SelectedComponent = selectedAction.component;
        return <SelectedComponent />;
    };

    return (
        <div className={styles.burnedAppliances}>
            <Sidebar 
                actions={actions} 
                onSelectAction={setSelectedAction} 
                defaultAction={selectedAction} 
                admin={true}
            />
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;