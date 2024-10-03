import UnderConstruction from "../UnderConstruction/UnderConstruction";
import styles from "./BurnedAppliances.module.css";
import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Claims from "../../components/Claims/Claims.jsx";
import BurnedArtifacts from "../../components/BurnedArtifacts/BurnedArtifacts.jsx";
import Clients from "../../components/Clients/Clients.jsx";



const BurnedAppliances = () => {
    const [selectedAction, setSelectedAction] = useState(null);

    const actions = [
        { label: 'Reclamos', component: Claims },
        { label: 'Artefactos Quemados', component: BurnedArtifacts },
        { label: 'Tecnicos', component: () => <div>Tecnicos</div> },
        { label: 'Clientes', component: Clients },
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