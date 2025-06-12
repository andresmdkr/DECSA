import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../auth/api.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const fetchAllTechnicalServices = createAsyncThunk(
  'technicalService/fetchAllTechnicalServices',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.get(`${API_BASE_URL}/technical-service`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch technical services');
    }
  }
);


export const fetchTechnicalServiceById = createAsyncThunk(
  'technicalService/fetchTechnicalServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.get(`${API_BASE_URL}/technical-service/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch technical service');
    }
  }
);


export const createTechnicalService = createAsyncThunk(
  'technicalService/createTechnicalService',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.post(`${API_BASE_URL}/technical-service`, data, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create technical service');
    }
  }
);


export const updateTechnicalService = createAsyncThunk(
    'technicalService/updateTechnicalService',
    async ({ id, name, type, address, phone }, { rejectWithValue }) => { 
      try {
        const token = localStorage.getItem('token');
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await api.put(`${API_BASE_URL}/technical-service/${id}`, { name, type, address, phone }, config); 
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to update technical service');
      }
    }
  );
  


export const deleteTechnicalService = createAsyncThunk(
  'technicalService/deleteTechnicalService',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await api.delete(`${API_BASE_URL}/technical-service/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete technical service');
    }
  }
);

const technicalServiceSlice = createSlice({
  name: 'technicalService',
  initialState: {
    technicalService: null,
    technicalServices: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.technicalService = null;
      state.technicalServices = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTechnicalServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllTechnicalServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.technicalServices = action.payload;
      })
      .addCase(fetchAllTechnicalServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch technical services';
      })
      .addCase(fetchTechnicalServiceById.fulfilled, (state, action) => {
        state.technicalService = action.payload;
      })
      .addCase(createTechnicalService.fulfilled, (state, action) => {
        state.technicalServices.push(action.payload);
      })
      .addCase(updateTechnicalService.fulfilled, (state, action) => {
        const index = state.technicalServices.findIndex(ts => ts.id === action.payload.id);
        if (index !== -1) {
          state.technicalServices[index] = action.payload; 
        }
      })
      .addCase(deleteTechnicalService.fulfilled, (state, action) => {
        state.technicalServices = state.technicalServices.filter(ts => ts.id !== action.payload);
      });
  },
});

export const { resetState } = technicalServiceSlice.actions;
export default technicalServiceSlice.reducer;
