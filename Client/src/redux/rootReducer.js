import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import clientsReducer from './slices/clientsSlice';
import sacsReducer from './slices/sacsSlice';
import oacReducer from './slices/oacSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    clients: clientsReducer,
    sacs: sacsReducer,
    oacs: oacReducer,
});

export default rootReducer;
