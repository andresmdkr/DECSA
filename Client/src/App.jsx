import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch} from 'react-redux';

import Home from './pages/Home/Home';
import CustomerService from './pages/CustomerService/CustomerService.jsx';
import BurnedAppliances from './pages/BurnedAppliances/BurnedAppliances.jsx';
import Operations from './pages/Operations/Operations.jsx';
import Admin from './pages/Admin/Admin.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import Layout from './components/Layout/Layout';
import axios from 'axios';
import Loader from './components/Loader/Loader.jsx';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
/*     const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000); // Simula carga
    }, []);

    if (loading) {
        return <Loader />;
    } */

        
    //HACER QUE EL SERVIDOR NO SE REINCIE
/*     const dispatch = useDispatch();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            await axios.get(`${API_BASE_URL}/user`);
        }, 40000);

        return () => clearInterval(intervalId); 
    }, [dispatch]); */

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/customer-service"
                        element={
                            <ProtectedRoute allowedRoles={['Admin','Atencion al cliente']}>
                                <CustomerService />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/burned-appliances"
                        element={
                            <ProtectedRoute allowedRoles={['Admin','Artefactos Quemados']}>
                                <BurnedAppliances />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/operations"
                        element={
                            <ProtectedRoute allowedRoles={['Admin','Operaciones']}>
                                <Operations />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute allowedRoles={['Admin', 'Atencion al cliente', 'Operaciones']}>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
