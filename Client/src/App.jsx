import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import CustomerService from './pages/customerService/customerService.jsx';
import BurnedAppliances from './pages/BurnedAppliances/BurnedAppliances.jsx';
import Operations from './pages/Operations/Operations.jsx';
import Admin from './pages/Admin/Admin.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import Layout from './components/Layout/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/customer-service"
                        element={
                            <ProtectedRoute>
                                <CustomerService />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/burned-appliances"
                        element={
                            <ProtectedRoute>
                                <BurnedAppliances />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/operations"
                        element={
                            <ProtectedRoute>
                                <Operations />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                    <Route path="*" element={<ProtectedRoute />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
