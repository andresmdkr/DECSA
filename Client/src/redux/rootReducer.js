import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import clientsReducer from './slices/clientsSlice';
import sacsReducer from './slices/sacsSlice';
import oacReducer from './slices/oacSlice';
import artifactReducer from './slices/artifactsSlice';
import otReducer from './slices/otSlice';
import resolutionReducer from './slices/resolutionSlice.js';
import technicalServiceReducer from './slices/technicalServiceSlice';
import repairOrderReducer from './slices/repairOrderSlice'
import userReducer from './slices/userSlice.js'
import otiReducer from './slices/otiSlice.js'

const rootReducer = combineReducers({
    auth: authReducer,
    clients: clientsReducer,
    sacs: sacsReducer,
    oacs: oacReducer,
    artifacts: artifactReducer,
    ot: otReducer,
    oti: otiReducer,
    resolution: resolutionReducer,
    technicalService: technicalServiceReducer,
    repairOrder: repairOrderReducer,
    users: userReducer,
});

export default rootReducer;
