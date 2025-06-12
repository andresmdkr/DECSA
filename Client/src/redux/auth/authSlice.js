import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    status: 'idle',
    error: null,
};


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.status = 'loading';
        },
        loginSuccess: (state, action) => {
            state.status = 'succeeded';
            state.user = action.payload.user;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            console.log(localStorage.getItem('user'));
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            state.token = null;
            localStorage.removeItem('token');
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
