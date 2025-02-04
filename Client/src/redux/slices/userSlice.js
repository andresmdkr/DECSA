import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/user`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/user/${userId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user');
    }
  }
);

// Fetch user by name
export const fetchUserByName = createAsyncThunk(
  'users/fetchUserByName',
  async (name, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_BASE_URL}/user/find/${name}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user by name');
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(`${API_BASE_URL}/user/${userId}`, userData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update user');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(`${API_BASE_URL}/user/${userId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete user');
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.post(`${API_BASE_URL}/user`, userData, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to create user');
      }
    }
  );
  

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetUserState: (state) => {
      state.users = [];
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(createUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.push(action.payload); 
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserByName.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserByName.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserByName.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
