import Sidebar from '../../components/Sidebar/Sidebar';
import CustomerSearch from '../../components/CustomerSearch/CustomerSearch.jsx'; 
import styles from './CustomerService.module.css';
import { useState } from 'react';

const CustomerService = () => {
    const [selectedAction, setSelectedAction] = useState(null);

    const actions = [
        { label: 'Solicitud de Atención al Cliente (S.A.C)', component: CustomerSearch },
        /* { label: 'Accion 2', component: () => <div>Accion 2</div> }, */
    ];

    const renderContent = () => {
        if (!selectedAction) {
            return <div className={styles.defaultMessage}>Selecciona una acción de la barra lateral</div>;
        }
        const SelectedComponent = selectedAction.component;
        return <SelectedComponent />;
    };

    return (
        <div className={styles.customerService}>
            <Sidebar actions={actions} onSelectAction={setSelectedAction} />
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default CustomerService;
