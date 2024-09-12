import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt, faTools } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../redux/auth/authSlice';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';


const Navbar = () => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener la ruta actual
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState(location.pathname);
    const menuRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setMenuOpen(false);
        }
    };

    const navigateTo = (path) => {
        setSelectedTab(path);
        navigate(path);
    };

    useEffect(() => {
        document.addEventListener('click', closeMenu);
        return () => {
            document.removeEventListener('click', closeMenu);
        };
    }, []);

    useEffect(() => {
        setSelectedTab(location.pathname);
    }, [location.pathname]);


    return (
        <nav className={styles.navbar}>
            <div 
                className={styles.logoContainer} 
                onClick={() => navigateTo('/home')} 
                style={{ cursor: 'pointer' }}
            >
                <img src={logo} alt="Logo" className={styles.logo} />
            </div>
            <div className={styles.navLinks}>
                <span 
                    className={`${styles.navLink} ${selectedTab === '/customer-service' ? styles.selected : ''}`} 
                    onClick={() => navigateTo('/customer-service')}
                >
                    Atención al Cliente
                </span>
                <span 
                    className={`${styles.navLink} ${selectedTab === '/burned-appliances' ? styles.selected : ''}`} 
                    onClick={() => navigateTo('/burned-appliances')}
                >
                    Artefactos Quemados
                </span>
                <span 
                    className={`${styles.navLink} ${selectedTab === '/operations' ? styles.selected : ''}`} 
                    onClick={() => navigateTo('/operations')}
                >
                    Operaciones
                </span>
            </div>
            <div className={styles.userContainer} ref={menuRef}>
                <span 
                    className={`${styles.username} ${menuOpen ? styles.active : ''}`} 
                    onClick={toggleMenu}
                >
                    {user?.name} {user?.lastName}
                    <FontAwesomeIcon 
                        icon={faCog} 
                        className={`${styles.settingsIcon} ${menuOpen ? styles.settingsIconOpen : ''}`} 
                    />
                </span>
                
                {menuOpen && (
                    <div className={styles.dropdownMenu}>
                        {user?.role === 'admin' && (
                            <button className={styles.adminToolsButton} onClick={() => {navigateTo('/admin');toggleMenu()} }>   
                                <FontAwesomeIcon icon={faTools} /> Herramientas de Admin
                            </button>
                        )}
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
