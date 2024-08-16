import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/auth/authAPI';
import { loginStart, loginSuccess, loginFailure } from '../../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import logo from '../../assets/logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status } = useSelector((state) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverError, setServerError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        if (username) setUsernameError('');
    }, [username]);

    useEffect(() => {
        if (password) setPasswordError('');
    }, [password]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!username) {
            setUsernameError('Debe ingresar el usuario');
        }
        if (!password) {
            setPasswordError('Debe ingresar la contraseña');
        }

        if (username && password) {
            try {
                dispatch(loginStart());
                const data = await login(username, password);
                dispatch(loginSuccess({ user: { role: data.role, username: data.username, name:data.name, lastName:data.lastName}, token: data.token }));
                navigate('/home');
            } catch (error) {
                if (!error.response) {
                    setServerError('Error en el servidor, intente nuevamente');
                } else if (error.response.status === 401) {
                    setServerError(error.response.data.message);
                } else {
                    setServerError('Error en el servidor, intente nuevamente');
                }
                dispatch(loginFailure(error.message));
            }
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.logoContainer}>
                <img draggable="false" src={logo} alt="Logo" className={styles.logo} />
                <h1 className={styles.title}>PLATAFORMA EMPRESARIAL</h1>
            </div>
            <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>USUARIO:</label>
                    <input
                        name="username"
                        type="text"
                        className={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {usernameError && <p className={styles.error}>{usernameError}</p>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>CONTRASEÑA:</label>
                    <div className={styles.passwordInputContainer}>
                        <input
                            name="password"
                            type={passwordVisible ? 'text' : 'password'}
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={togglePasswordVisibility} className={styles.toggleButton}>
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {passwordError && <p className={styles.error}>{passwordError}</p>}
                </div>

                <button type="submit" className={status === 'loading' ? `${styles.loading}` : styles.button} disabled={status === 'loading'}>
                    {status === 'loading' ? (
                        <div className={styles.loadingSpinner}>
                            <AiOutlineLoading3Quarters className={styles.spinnerIcon} />
                            <span>Cargando...</span>
                        </div>
                    ) : (
                        'Ingresar'
                    )}
                </button>

                {serverError && <p className={styles.serverError}>{serverError}</p>}
            </form>
        </div>
    );
};

export default LoginForm;
