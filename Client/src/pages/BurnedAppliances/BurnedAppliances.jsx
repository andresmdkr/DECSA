import UnderConstruction from "../UnderConstruction/UnderConstruction";
import styles from "./BurnedAppliances.module.css";
import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Claims from "../../components/Claims/Claims.jsx";
import CustomerSearch from "../../components/CustomerSearch/CustomerSearch";



const BurnedAppliances = () => {
    const [selectedAction, setSelectedAction] = useState(null);

    const actions = [
        { label: 'Reclamos', component: Claims },
        { label: 'Artefactos Quemados', component: () => <div>Artefactos Quemados</div> },
        { label: 'Tecnicos', component: () => <div>Tecnicos</div> },
        { label: 'Clientes', component: () => <div>Clientes</div> },
    ];

    const renderContent = () => {
        if (!selectedAction) {
            return <div className={styles.defaultMessage}>Selecciona una acción de la barra lateral</div>;
        }
        const SelectedComponent = selectedAction.component;
        return <SelectedComponent />;
    };

    return (
        <div className={styles.burnedAppliances}>
            <Sidebar actions={actions} onSelectAction={setSelectedAction} />
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default BurnedAppliances;