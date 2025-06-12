import UnderConstruction from "../UnderConstruction/UnderConstruction";
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './Operations.module.css';
import IncomingClaims from '../../components/IncomingClaims/IncomingClaims';
import OngoingClaims from '../../components/OngoingClaims/OngoingClaims';
import ClaimsOp from "../../components/ClaimsOp/ClaimsOp";
import OpReports from "../../components/OpReport/OpReports.jsx";
import Clients from "../../components/Clients/Clients.jsx";
import CustomerSearchOp from '../../components/CustomerSearchOp/CustomerSearchOp.jsx'; 
import InternalWorkOrders from '../../components/InternalWorkOrders/InternalWorkOrders.jsx';
import OperationalAgent from '../../components/OperationalAgent/OperationalAgent.jsx';

import { useState } from 'react';

const Operations = () => {


    const user = JSON.parse(localStorage.getItem("user"));
    const allowedUser = "Admin"; 


    const actions = [
        { label: 'Solicitud de Atención al Cliente (S.A.C)', component: CustomerSearchOp },
/*         { label: 'Reclamos Entrantes', component: IncomingClaims }, */
        { label: 'Reclamos Pendientes/Curso', component: OngoingClaims },
        { label: 'Todos los Reclamos', component: ClaimsOp },
        { label: 'Agentes Operativos', component: OperationalAgent },
        { label: 'Reportes', component: OpReports },

    ];

    if (user?.role === allowedUser) {
        actions.push({ label: 'S.A.Cs por O.T.I', component: InternalWorkOrders });
    }

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