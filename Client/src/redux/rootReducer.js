import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import clientsReducer from './slices/clientsSlice';
import sacsReducer from './slices/sacsSlice';
import oacReducer from './slices/oacSlice';
import artifactReducer from './slices/artifactsSlice';
import otReducer from './slices/otSlice';
import resolutionReducer from './slices/resolutionSlice.js';
import technicalServiceReducer from './slices/technicalServiceSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    clients: clientsReducer,
    sacs: sacsReducer,
    oacs: oacReducer,
    artifacts: artifactReducer,
    ot: otReducer,
    resolution: resolutionReducer,
    technicalService: technicalServiceReducer
});

export default rootReducer;
