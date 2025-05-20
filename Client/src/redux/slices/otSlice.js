import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const fetchWorkOrders = createAsyncThunk(
    'workOrders/fetchWorkOrders',
    async ({ sacId, burnedArtifactId }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          params: { sacId, burnedArtifactId }, 
        };
        const response = await axios.get(`${API_BASE_URL}/ot`, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch Work Orders');
      }
    }
  );
  


  export const createWorkOrder = createAsyncThunk(
    'workOrders/createWorkOrder',
    async ({ sacId, burnedArtifactId, workOrderData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
  
        formData.append('sacId', sacId || '');
        formData.append('burnedArtifactId', burnedArtifactId || '');
        formData.append('status', workOrderData.status);
        formData.append('reason', workOrderData.reason);
        formData.append('description', workOrderData.description);
        formData.append('technicalService', workOrderData.technicalService || '');
        
        // Nuevos campos
        formData.append('installationInterior', workOrderData.installationInterior || null);
        formData.append('installationExterior', workOrderData.installationExterior|| null);
        formData.append('protectionThermal', workOrderData.protectionThermal || false);
        formData.append('protectionBreaker', workOrderData.protectionBreaker || false);
        formData.append('protectionOther', workOrderData.protectionOther || '');
  
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(`${API_BASE_URL}/ot`, formData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Error creating Work Order');
      }
    }
  );


  export const updateWorkOrder = createAsyncThunk(
    'workOrders/updateWorkOrder',
    async ({ workOrderId, workOrderData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
  
        formData.append('status', workOrderData.status);
        formData.append('reason', workOrderData.reason);
        formData.append('description', workOrderData.description);
        formData.append('technicalService', workOrderData.technicalService);
        
        // Nuevos campos
        formData.append('installationInterior', workOrderData.installationInterior);
        formData.append('installationExterior', workOrderData.installationExterior);
        formData.append('protectionThermal', workOrderData.protectionThermal);
        formData.append('protectionBreaker', workOrderData.protectionBreaker);
        formData.append('protectionOther', workOrderData.protectionOther || '');
  
        if (workOrderData.files) {
          workOrderData.files.forEach((file) => {
            formData.append('files', file);
          });
        }
  
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(`${API_BASE_URL}/ot/${workOrderId}`, formData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Error updating Work Order');
      }
    }
  );


const otSlice = createSlice({
  name: 'workOrders',
  initialState: {
    workOrders: [], 
    status: 'idle', 
    error: null,   
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.workOrders = action.payload;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createWorkOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.workOrders.push(action.payload); 
      })
      .addCase(createWorkOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(updateWorkOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateWorkOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.workOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.workOrders[index] = action.payload; 
        }
      })
      .addCase(updateWorkOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default otSlice.reducer;
