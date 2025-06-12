import api from './api.js'; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (username, password) => {
    const response = await api.post(`${API_BASE_URL}/auth/login`, { username, password });
    return {
        token: response.data.token,
        role: response.data.role,
        username: response.data.username,
        name: response.data.name,
        lastName: response.data.lastName,
    };
};
