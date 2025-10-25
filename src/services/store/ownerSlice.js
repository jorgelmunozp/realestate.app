import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';

// 🔹 Obtener todos los dueños
export const fetchOwners = createAsyncThunk('owner/fetchAll', async () => {
  const res = await api.get('/owner');
  return res.data;
});

// 🔹 Crear dueño
export const createOwner = createAsyncThunk('owner/create', async (ownerData) => {
  const res = await api.post('/owner', ownerData);
  return res.data;
});

const ownerSlice = createSlice({
  name: 'owner',
  initialState: { owners: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwners.pending, (state) => { state.loading = true; })
      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.loading = false;
        state.owners = action.payload;
      })
      .addCase(fetchOwners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createOwner.fulfilled, (state, action) => {
        state.owners.push(action.payload);
      });
  },
});

export default ownerSlice.reducer;
