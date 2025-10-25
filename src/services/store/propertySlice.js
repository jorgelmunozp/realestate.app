import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';

// 🔹 Obtener todas las propiedades
export const fetchProperties = createAsyncThunk('property/fetchAll', async () => {
  const res = await api.get('/property');
  return res.data;
});

// 🔹 Crear una nueva propiedad
export const createProperty = createAsyncThunk('property/create', async (propertyData) => {
  const res = await api.post('/property', propertyData);
  return res.data;
});

const propertySlice = createSlice({
  name: 'property',
  initialState: { properties: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.properties.push(action.payload);
      });
  },
});

export default propertySlice.reducer;
