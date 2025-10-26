import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';

// =========================================================
// 🔹 ENDPOINT desde variables de entorno (.env)
// =========================================================
const ENDPOINT = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

// =========================================================
// 🔹 Obtener imágenes de una propiedad
// =========================================================
export const fetchPropertyImages = createAsyncThunk(
  'propertyImage/fetchByProperty',
  async (propertyId) => {
    const res = await api.get(`${ENDPOINT}/property/${propertyId}`);
    return res.data;
  }
);

// =========================================================
// 🔹 Subir nueva imagen
// =========================================================
export const uploadPropertyImage = createAsyncThunk(
  'propertyImage/upload',
  async (imageData) => {
    const res = await api.post(`${ENDPOINT}`, imageData);
    return res.data;
  }
);

// =========================================================
// 🔹 Slice principal
// =========================================================
const propertyImageSlice = createSlice({
  name: 'propertyImage',
  initialState: { images: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPropertyImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchPropertyImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(uploadPropertyImage.fulfilled, (state, action) => {
        state.images.push(action.payload);
      });
  },
});

export default propertyImageSlice.reducer;
