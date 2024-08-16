import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar'; 
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const showNavbar = !['/', '/login'].includes(location.pathname);

    return (
        <div className={styles.layout}>
            {showNavbar && <Navbar />}
            <main className={showNavbar ? styles.mainContentWithNavbar : styles.mainContentWithoutNavbar}>
                {children}
            </main>
        </div>
    );
};

export default Layout;

