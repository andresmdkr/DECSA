import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Obtener la URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Thunk para obtener OACs
export const fetchOACs = createAsyncThunk(
  'oacs/fetchOACs',
  async (sacId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { sacId },
      };

      const response = await axios.get(`${API_BASE_URL}/oac`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch OACs');
    }
  }
);

// Thunk para crear una nueva OAC
export const createOac = createAsyncThunk(
  'oacs/createOac',
  async ({ sacId, oacData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Agregar los campos del formulario al FormData
      formData.append('sacId', sacId);
      formData.append('status', oacData.status);
      formData.append('issueDate', oacData.issueDate);
      formData.append('resolution', oacData.resolution);
      formData.append('resolutionDate', oacData.resolutionDate);
      formData.append('assignedTechnician', oacData.assignedTechnician);

      // Agregar los archivos seleccionados
      oacData.files.forEach((file) => {
        formData.append('files', file);
      });

      // Configuración de los headers con el token y el tipo de contenido
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,  // Agregamos el token aquí
        },
      };

      // Realizamos la solicitud POST al endpoint para crear la OAC
      const response = await axios.post(`${API_BASE_URL}/oac`, formData, config);
      console.log(response)
      return response.data;  // Devolvemos los datos de la OAC creada
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error creating OAC');
    }
  }
);

// Slice para manejar OACs
const oacSlice = createSlice({
  name: 'oacs',
  initialState: {
    oacs: [],        // Lista de OACs
    status: 'idle',  // Estado de la operación ('idle', 'loading', 'succeeded', 'failed')
    error: null,     // Mensaje de error en caso de que ocurra
  },
  reducers: {
    // Aquí puedes agregar otros reducers si lo necesitas
  },
  extraReducers: (builder) => {
    builder
      // Estado para la obtención de OACs
      .addCase(fetchOACs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOACs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.oacs = action.payload;  // Guardamos las OACs obtenidas
      })
      .addCase(fetchOACs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Estado para la creación de una OAC
      .addCase(createOac.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOac.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.oacs.push(action.payload);  // Agregamos la OAC recién creada
      })
      .addCase(createOac.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;    // Guardamos el mensaje de error
      });
  },
});

export default oacSlice.reducer;
