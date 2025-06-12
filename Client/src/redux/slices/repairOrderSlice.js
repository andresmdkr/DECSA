import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../auth/api.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchRepairOrder = createAsyncThunk(
  'repairOrders/fetchRepairOrders',
  async ({ burnedArtifactId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await api.get(`${API_BASE_URL}/repair-order/${burnedArtifactId}`, config);
      console.log('Repair Order Data:', response.data)
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
          return rejectWithValue({ notFound: true });
      }
      return rejectWithValue(error.response.data);
    }
  }
);


export const createRepairOrder = createAsyncThunk(
  'repairOrders/createRepairOrder',
  async ({repairOrderData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
        
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await api.post(`${API_BASE_URL}/repair-order`, repairOrderData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error creating Repair Order');
    }
  }
);


export const updateRepairOrder = createAsyncThunk(
  'repairOrders/updateRepairOrder',
  async ({ repairOrderId, repairOrderData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.put(`${API_BASE_URL}/repair-order/${repairOrderId}`,repairOrderData , config);
      console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating Repair Order');
    }
  }
);

const repairOrderSlice = createSlice({
  name: 'repairOrders',
  initialState: {
    repairOrder: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepairOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRepairOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.repairOrder = action.payload;
      })
      .addCase(fetchRepairOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createRepairOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRepairOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.repairOrder = (action.payload);
      })
      .addCase(createRepairOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateRepairOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRepairOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.repairOrder = action.payload;
      })
      .addCase(updateRepairOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default repairOrderSlice.reducer;
