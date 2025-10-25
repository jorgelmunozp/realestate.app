import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';

// 🔹 Obtener trazas por propiedad
export const fetchPropertyTraces = createAsyncThunk('propertyTrace/fetchByProperty', async (propertyId) => {
  const res = await api.get(`/propertytrace/property/${propertyId}`);
  return res.data;
});

// 🔹 Agregar nueva traza
export const createPropertyTrace = createAsyncThunk('propertyTrace/create', async (traceData) => {
  const res = await api.post('/propertytrace', traceData);
  return res.data;
});

const propertyTraceSlice = createSlice({
  name: 'propertyTrace',
  initialState: { traces: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyTraces.pending, (state) => { state.loading = true; })
      .addCase(fetchPropertyTraces.fulfilled, (state, action) => {
        state.loading = false;
        state.traces = action.payload;
      })
      .addCase(fetchPropertyTraces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPropertyTrace.fulfilled, (state, action) => {
        state.traces.push(action.payload);
      });
  },
});

export default propertyTraceSlice.reducer;
