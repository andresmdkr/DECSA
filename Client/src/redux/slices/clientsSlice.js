import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchClientByAccountNumber = createAsyncThunk(
  'client/fetchClientByAccountNumber',
  async (accountNumber, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/client/${accountNumber}`, config);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return rejectWithValue('Client not found');
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch client');
    }
  }
);

export const updateClientByAccountNumber = createAsyncThunk(
  'client/updateClientByAccountNumber',
  async ({ accountNumber, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(`${API_BASE_URL}/client/${accountNumber}`, data, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update client');
    }
  }
);


export const searchClientsByName = createAsyncThunk(
  'client/searchClientsByName',
  async (holderName, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/client/search?holderName=${holderName}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to search clients');
    }
  }
);

export const searchClientsBySubstation = createAsyncThunk(
  'client/searchClientsBySubstation',
  async (substation, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_BASE_URL}/client/search?substation=${substation}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to search clients by substation');
    }
  }
);

export const searchClientsByDevice = createAsyncThunk(
  'client/searchClientsByDevice',
  async (device, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/client/search?device=${device}`, config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to search clients by device');
    }
  }
);


const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    client: null,
    clients: [],
    status: 'idle', 
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.client = null;
      state.clients = []; 
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientByAccountNumber.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClientByAccountNumber.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload;
      })
      .addCase(fetchClientByAccountNumber.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch client';
      })
      .addCase(updateClientByAccountNumber.fulfilled, (state, action) => {
        state.client = { ...state.client, ...action.payload };
      })
      
      .addCase(updateClientByAccountNumber.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update client';
      })
      .addCase(searchClientsByName.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchClientsByName.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload; 
      })
      .addCase(searchClientsByName.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to search clients';
      })
      .addCase(searchClientsBySubstation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchClientsBySubstation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(searchClientsBySubstation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to search clients by substation';
      })
      .addCase(searchClientsByDevice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchClientsByDevice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.client = action.payload[0] || null;
      })
      .addCase(searchClientsByDevice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to search clients by device';
      });
      
  },
});

export const { resetState } = clientsSlice.actions;
export default clientsSlice.reducer;

