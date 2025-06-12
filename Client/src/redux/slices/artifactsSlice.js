import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../auth/api.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchArtifact = createAsyncThunk(
  'artifacts/fetchArtifact',
  async (artifactId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      };

      const response = await api.get(`${API_BASE_URL}/artifact/${artifactId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch artifact');
    }
  }
);


export const fetchAllArtifacts = createAsyncThunk(
  'artifacts/fetchAllArtifacts',
  async ({ page = 1, limit = 10, sacId = null,clientId=null,status = null }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit, sacId,clientId, status }, 
      };


      const response = await api.get(`${API_BASE_URL}/artifact`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch artifacts');
    }
  }
);


export const updateArtifact = createAsyncThunk(
  'artifacts/updateArtifact',
  async ({ artifactId, artifactData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.put(`${API_BASE_URL}/artifact/${artifactId}`, artifactData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update artifact');
    }
  }
);

const artifactSlice = createSlice({
  name: 'artifacts',
  initialState: {
    artifact: null,
    artifacts: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetArtifactState: (state) => {
      state.artifact = null;
      state.artifacts = [];
      state.totalItems = 0;
      state.totalPages = 1;
      state.currentPage = 1;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtifact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchArtifact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.artifact = action.payload;
      })
      .addCase(fetchArtifact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAllArtifacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllArtifacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.artifacts = action.payload.artifacts;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllArtifacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateArtifact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateArtifact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.artifact = action.payload;
      })
      .addCase(updateArtifact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetArtifactState } = artifactSlice.actions;
export default artifactSlice.reducer;
