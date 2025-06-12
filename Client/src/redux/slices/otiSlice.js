import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../auth/api.js';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchInternalWorkOrders = createAsyncThunk(
  'internalWorkOrders/fetchInternalWorkOrders',
  async ({ sacId, otiId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { sacId, otiId, page, limit }, 
      };
      const response = await api.get(`${API_BASE_URL}/oti`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch Internal Work Orders');
    }
  }
);



export const createInternalWorkOrder = createAsyncThunk(
  'internalWorkOrders/createInternalWorkOrder',
  async ({ internalWorkOrderData }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');

      const now = new Date();
      const startTime = now.toTimeString().split(' ')[0].slice(0, 5)

      console.log(internalWorkOrderData);

      const sacData = {
        claimReason: internalWorkOrderData.task,
        eventDate: internalWorkOrderData.date,
        description: internalWorkOrderData.observations || '',
        status: 'Open',
        area: 'op_adm',
        startTime,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let sacId = internalWorkOrderData.sacId;

      if (!sacId) {
        const sacResponse = await api.post(`${API_BASE_URL}/sacs`, sacData, config);
        sacId = sacResponse.data.id;
      }

      const formData = new FormData();
      formData.append('sacId', sacId);
      formData.append('status', internalWorkOrderData.status);
      formData.append('task', internalWorkOrderData.task);
      formData.append('date', internalWorkOrderData.date);
      formData.append('location', internalWorkOrderData.location);
      formData.append('observations', internalWorkOrderData.observations || '');
      formData.append('assignedTo', internalWorkOrderData.assignedTo);
      formData.append('completionDate', internalWorkOrderData.completionDate|| null);
      formData.append('isDerived', internalWorkOrderData.isDerived || false);

      if (internalWorkOrderData.files) {
        internalWorkOrderData.files.forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const otiResponse = await api.post(`${API_BASE_URL}/oti`, formData, config);
      return otiResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error creating Internal Work Order and SAC');
    }
  }
);


export const updateInternalWorkOrder = createAsyncThunk(
  'internalWorkOrders/updateInternalWorkOrder',
  async ({ internalWorkOrderId, internalWorkOrderData, sacId, isDerived }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Si hay SAC y no es derivado, actualizar también el SAC
      if (sacId && !isDerived) {
        const now = new Date();
        const argNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));

        const formattedDate = argNow.toISOString().split('T')[0]; 
        const formattedTime = argNow.toTimeString().split(' ')[0];

        const sacData = {
          claimReason: internalWorkOrderData.task,
          eventDate: internalWorkOrderData.date,
          description: internalWorkOrderData.observations || '',
          status: internalWorkOrderData.status,
        };

        // Si el estado es cerrado, agregar datos extra
        if (internalWorkOrderData.status === "Closed") {
          sacData.closeDate = formattedDate;
          sacData.closeTime = formattedTime;
          sacData.closedBy = `${user.name} ${user.lastName}`;
        }

        await api.put(`${API_BASE_URL}/sacs/${sacId}`, sacData, config);
      }

      // Crear FormData para OTI
      const formData = new FormData();
      formData.append('status', internalWorkOrderData.status);
      formData.append('task', internalWorkOrderData.task);
      formData.append('date', internalWorkOrderData.date);
      formData.append('location', internalWorkOrderData.location);
      formData.append('observations', internalWorkOrderData.observations);
      formData.append('assignedTo', internalWorkOrderData.assignedTo);
      formData.append('completionDate', internalWorkOrderData.completionDate || null);

      if (internalWorkOrderData.files) {
        internalWorkOrderData.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await api.put(`${API_BASE_URL}/oti/${internalWorkOrderId}`, formData, config);
      return response.data;

    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating Internal Work Order and SAC');
    }
  }
);




const otiSlice = createSlice({
  name: 'internalWorkOrders',
  initialState: {
    internalWorkOrders: [],
    total: 0,  
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternalWorkOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInternalWorkOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.internalWorkOrders = action.payload.rows;  
        state.total = action.payload.total; 
      })
      .addCase(fetchInternalWorkOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createInternalWorkOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createInternalWorkOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.internalWorkOrders.push(action.payload);
      })
      .addCase(createInternalWorkOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateInternalWorkOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateInternalWorkOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.internalWorkOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.internalWorkOrders[index] = action.payload;
        }
      })
      .addCase(updateInternalWorkOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default otiSlice.reducer;
