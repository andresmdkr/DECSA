import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import clientsReducer from './slices/clientsSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    clients: clientsReducer,
});

export default rootReducer;
