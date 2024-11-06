import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const fetchResolutions = createAsyncThunk(
  'resolutions/fetchResolutions',
  async ({ sacId, burnedArtifactId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { sacId, burnedArtifactId }, 
      };
      const response = await axios.get(`${API_BASE_URL}/resolution`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch resolutions');
    }
  }
);

export const fetchResolutionById = createAsyncThunk(
  'resolutions/fetchResolutionById',
  async (resolutionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${API_BASE_URL}/resolution/${resolutionId}`, config);
      console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch resolution by ID');
    }
  }
);


export const createResolution = createAsyncThunk(
  'resolutions/createResolution',
  async ({ sacId, resolutionData }, { rejectWithValue }) => {
    console.log(resolutionData);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${API_BASE_URL}/resolution/sac/${sacId}`, resolutionData, config); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create resolution');
    }
  }
);

export const updateResolution = createAsyncThunk(
  'resolutions/updateResolution',
  async ({ resolutionId, resolutionData }, { rejectWithValue }) => { 
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_BASE_URL}/resolution/${resolutionId}`, resolutionData, config); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update resolution');
    }
  }
);

const resolutionsSlice = createSlice({
  name: 'resolutions',
  initialState: {
    resolutions: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetResolutionsState: (state) => {
      state.resolutions = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchResolutions.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchResolutions.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.resolutions = action.payload;
    })
    .addCase(fetchResolutions.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    .addCase(fetchResolutionById.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchResolutionById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.resolutions = [action.payload]; 
    })
    .addCase(fetchResolutionById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
      .addCase(createResolution.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createResolution.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resolutions.push(action.payload);
      })
      .addCase(createResolution.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateResolution.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateResolution.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedResolution = action.payload;
        const index = state.resolutions.findIndex((res) => res.id === updatedResolution.id);
        if (index !== -1) {
          state.resolutions[index] = updatedResolution;
        }
      })
      .addCase(updateResolution.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetResolutionsState } = resolutionsSlice.actions;
export default resolutionsSlice.reducer;
