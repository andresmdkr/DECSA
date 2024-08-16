import axios from 'axios';

export const login = async (username, password) => {
    const response = await axios.post('http://localhost:3001/auth/login', { username, password });
    return {
        token: response.data.token,
        role: response.data.role,
        username: response.data.username,
        name: response.data.name,
        lastName: response.data.lastName,
    };
};
