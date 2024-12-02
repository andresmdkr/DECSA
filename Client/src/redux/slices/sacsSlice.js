  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import axios from 'axios';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  export const fetchSACs = createAsyncThunk(
    'sacs/fetchSACs',
    async (
      { page = 1, limit = 10, sacId = null, claimReason = null, clientId = null, status = null, priority = null, area = null, startDate = null, endDate = null },
      { rejectWithValue }
    ) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page, limit, sacId, claimReason, clientId, status, priority, area, startDate, endDate }, 
        };
  
        const response = await axios.get(`${API_BASE_URL}/sacs`, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch SACs');
      }
    }
  );
  



  export const createSAC = createAsyncThunk(
    'sacs/createSAC',
    async (sacData, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.post(`${API_BASE_URL}/sacs`, sacData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to create SAC');
      }
    }
  );


  export const updateSAC = createAsyncThunk(
    'sacs/updateSAC',
    async ({ id, sacData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.put(`${API_BASE_URL}/sacs/${id}`, sacData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to update SAC');
      }
    }
  );


  const sacsSlice = createSlice({
    name: 'sacs',
    initialState: {
      sacs: [],
      status: 'idle',
      error: null,
      total: 0,    
    },
    reducers: {
      resetSacsState: (state) => {
        state.sacs = [];
        state.status = 'idle';
        state.error = null;
        state.total = 0;
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchSACs.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(fetchSACs.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.sacs = action.payload.sacs;
          state.total = action.payload.total; 
        })
        .addCase(fetchSACs.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
        
        .addCase(createSAC.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(createSAC.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.sacs.push(action.payload);  
        })
        .addCase(createSAC.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
        .addCase(updateSAC.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(updateSAC.fulfilled, (state, action) => {
          state.status = 'succeeded';
          const updatedSAC = action.payload;
          const existingSACIndex = state.sacs.findIndex((sac) => sac.id === updatedSAC.id);
          if (existingSACIndex !== -1) {
            state.sacs[existingSACIndex] = updatedSAC;
          }
        })
        .addCase(updateSAC.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });

  }});



  export const { resetSacsState } = sacsSlice.actions;
  export default sacsSlice.reducer;
