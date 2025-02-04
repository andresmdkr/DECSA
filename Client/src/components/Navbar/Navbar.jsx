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
    const location = useLocation();
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

    const navLinks = {
        'Admin': [
            { path: '/customer-service', label: 'Atención al Cliente' },
            { path: '/burned-appliances', label: 'Artefactos Quemados' },
            { path: '/operations', label: 'Operaciones' },
        ],
        'Atencion al cliente': [
            { path: '/customer-service', label: 'Atención al Cliente' },
        ],
        'Artefactos Quemados': [
            { path: '/burned-appliances', label: 'Artefactos Quemados' },
        ],
        'Operaciones': [
            { path: '/operations', label: 'Operaciones' },
        ],
        'Comercial': [], // Si no tienen enlaces visibles
    };

    // Obtener los enlaces disponibles para el usuario actual
    const linksForRole = navLinks[user?.role] || [];

    return (
        <nav className={styles.navbar}>
            <div
                className={styles.logoContainer}
            >
                <img src={logo} alt="Logo" className={styles.logo} />
            </div>
            <div className={styles.navLinks}>
                {linksForRole.map((link) => (
                    <span
                        key={link.path}
                        className={`${styles.navLink} ${selectedTab === link.path ? styles.selected : ''}`}
                        onClick={() => navigateTo(link.path)}
                    >
                        {link.label}
                    </span>
                ))}
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
                        {user?.role === 'Admin' && (
                            <button
                                className={styles.adminToolsButton}
                                onClick={() => {
                                    navigateTo('/admin');
                                    toggleMenu();
                                }}
                            >
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
