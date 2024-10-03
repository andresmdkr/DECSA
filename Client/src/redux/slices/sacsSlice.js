  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import axios from 'axios';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    export const fetchSACs = createAsyncThunk(
      'sacs/fetchSACs',
      async ({ page = 1, limit = 10, sacId = null,clientId=null,status = null, priority = null,area=null }, { rejectWithValue }) => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: { page, limit, sacId,clientId, status, priority,area }, 
          };

          const response = await axios.get(`${API_BASE_URL}/sacs`, config);
          console.log(response.data);
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

  export const fetchResolutionBySAC = createAsyncThunk(
    'sacs/fetchResolutionBySAC',
    async ({ sacId }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        console.log(sacId);
        const response = await axios.get(`${API_BASE_URL}/sacs/${sacId}/resolution`, config);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return null; 
        }
        return rejectWithValue(error.response.data);
      }
    }
  );

  export const createResolution = createAsyncThunk(
    'sacs/createResolution',
    async ({ sacId, resolutionData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.post(`${API_BASE_URL}/sacs/${sacId}/resolution`, resolutionData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to create Resolution');
      }
    }
  );
  
  export const updateResolution = createAsyncThunk(
    'sacs/updateResolution',
    async ({ sacId, resolutionId, resolutionData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.put(`${API_BASE_URL}/sacs/${sacId}/resolution/${resolutionId}`, resolutionData, config);
        return response.data; 
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to update Resolution');
      }
    }
  );
  

  const sacsSlice = createSlice({
    name: 'sacs',
    initialState: {
      sacs: [],
      resolution: null, 
      status: 'idle',
      error: null,
      total: 0,    
    },
    reducers: {
      resetSacsState: (state) => {
        state.sacs = [];
        state.resolution = null;
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
        })
        .addCase(createResolution.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(createResolution.fulfilled, (state, action) => {
          state.status = 'succeeded';
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
       
        })
        .addCase(updateResolution.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
        .addCase(fetchResolutionBySAC.pending, (state) => {
          state.error = null;
        })
        .addCase(fetchResolutionBySAC.fulfilled, (state, action) => {
          state.resolution = action.payload; 
        })
        .addCase(fetchResolutionBySAC.rejected, (state, action) => {
          state.error = action.payload;
        });

  }});



  export const { resetSacsState } = sacsSlice.actions;
  export default sacsSlice.reducer;
