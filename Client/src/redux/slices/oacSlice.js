import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const fetchOACs = createAsyncThunk(
  'oacs/fetchOACs',
  async (sacId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { sacId },
      };
      const response = await axios.get(`${API_BASE_URL}/oac`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch OACs');
    }
  }
);


export const createOac = createAsyncThunk(
  'oacs/createOac',
  async ({ sacId, oacData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('sacId', sacId);
      formData.append('status', oacData.status);
      formData.append('issueDate', oacData.issueDate);
      formData.append('issueTime', oacData.issueTime);
      formData.append('assignedPerson', oacData.assignedPerson);
      formData.append('assignedBy', oacData.assignedBy);
      formData.append('assignmentTime', oacData.assignmentTime);
      formData.append('oacReason', oacData.oacReason);
      formData.append('tension', oacData.tension);
      formData.append('pendingTasks', oacData.pendingTasks); 
      formData.append('failureReason' , oacData.failureReason);
      formData.append('performedWork' , oacData.performedWork);

      oacData.files.forEach((file) => {
        formData.append('files', file);
      });
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/oac`, formData, config);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error creating OAC');
    }
  }
);

export const updateOac = createAsyncThunk(
  'oacs/updateOac',
  async ({ sacId, oacId, oacData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('status', oacData.status);
      formData.append('issueDate', oacData.issueDate);
      formData.append('issueTime', oacData.issueTime);
      formData.append('assignedPerson', oacData.assignedPerson);
      formData.append('assignmentTime', oacData.assignmentTime);
      formData.append('oacReason', oacData.oacReason);
      formData.append('tension', oacData.tension);
      formData.append('pendingTasks', oacData.pendingTasks); 
      formData.append('failureReason' , oacData.failureReason);
      formData.append('performedWork' , oacData.performedWork);

      oacData.files.forEach((file) => {
        formData.append('files', file);
      });

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_BASE_URL}/oac/${oacId}`, formData, config);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating OAC');
    }
  }
);


const oacSlice = createSlice({
  name: 'oacs',
  initialState: {
    oacs: [],        
    status: 'idle',  
    error: null,    
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOACs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOACs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.oacs = action.payload;
      })
      .addCase(fetchOACs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createOac.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOac.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.oacs.push(action.payload);  
      })
      .addCase(createOac.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;    
      })
      .addCase(updateOac.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOac.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.oacs.findIndex(oac => oac.id === action.payload.id);
        if (index !== -1) {
          state.oacs[index] = action.payload;
        }
      })
      .addCase(updateOac.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;    
      });
  },
});

export default oacSlice.reducer;
