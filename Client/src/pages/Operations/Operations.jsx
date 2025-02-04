import UnderConstruction from "../UnderConstruction/UnderConstruction";
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './Operations.module.css';
import IncomingClaims from '../../components/IncomingClaims/IncomingClaims';
import OngoingClaims from '../../components/OngoingClaims/OngoingClaims';
import ClaimsOp from "../../components/ClaimsOp/ClaimsOp";
import OpReports from "../../components/OpReport/OpReports.jsx";
import Clients from "../../components/Clients/Clients.jsx";
import { useState } from 'react';

const Operations = () => {
    const actions = [
        { label: 'Reclamos Entrantes', component: IncomingClaims },
        { label: 'Reclamos En Curso', component: OngoingClaims },
        { label: 'Todos los Reclamos', component: ClaimsOp },
        { label: 'Buscador de Clientes', component: Clients },
        { label: 'Reportes', component: OpReports },

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
        <div className={styles.operations}>
            <Sidebar 
                actions={actions} 
                onSelectAction={setSelectedAction} 
                defaultAction={selectedAction} 
            />
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Operations;