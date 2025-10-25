import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';
import { errorWrapper } from '../../services/api/errorWrapper';

// Obtener propiedades con paginación e imágenes
export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async ({ page = 1, limit = 6, refresh = false } = {}) => {
    const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
    const propertyImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

    const res = await errorWrapper(
      api.get(`${propertyEndpoint}?page=${page}&limit=${limit}${refresh ? '&refresh=true' : ''}`)
    );
    if (!res.ok) throw res.error;
    const body = res.data || {};
    const items = Array.isArray(body) ? body : body.data || [];

    const withImages = await Promise.all(
      items.map(async (p) => {
        try {
          const resImg = await errorWrapper(
            api.get(`${propertyImageEndpoint}?idProperty=${p.idProperty}${refresh ? '&refresh=true' : ''}`)
          );
          if (!resImg.ok) throw resImg.error;
          const imgBody = resImg.data || [];
          const firstImg = Array.isArray(imgBody) ? imgBody[0] : imgBody?.[0];
          return { ...p, image: firstImg || null };
        } catch {
          return { ...p, image: null };
        }
      })
    );

    const meta = body.meta || { page, limit, total: withImages.length, last_page: 1 };
    return { items: withImages, meta };
  }
);

// Crear una nueva propiedad
export const createProperty = createAsyncThunk('property/create', async (propertyData) => {
  const res = await api.post('/property', propertyData);
  return res.data;
});

const propertySlice = createSlice({
  name: 'property',
  initialState: { properties: [], meta: { page: 1, limit: 6, total: 0, last_page: 1 }, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.items || [];
        state.meta = action.payload.meta || state.meta;
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
