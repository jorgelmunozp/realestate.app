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
      api.get(`${propertyEndpoint}?page=${page}&limit=${limit}${refresh ? '&refresh=true' : ''}`),
      { unwrap: false }
    );
    if (!res.ok) throw res.error;
    const body = res.data || {};
    // body puede ser:
    // - array de propiedades
    // - objeto { data: [...], meta }
    // - objeto { items: [...], meta }
    // - objeto { data: { items: [...], meta } }
    let items = [];
    let meta = undefined;
    if (Array.isArray(body)) {
      items = body;
    } else if (Array.isArray(body.items)) {
      items = body.items;
      meta = body.meta;
    } else if (Array.isArray(body.data)) {
      items = body.data;
      meta = body.meta;
    } else if (body.data && typeof body.data === 'object') {
      const inner = body.data;
      if (Array.isArray(inner.items)) {
        items = inner.items;
        meta = inner.meta || body.meta;
      }
    }

    const withImages = await Promise.all(
      items.map(async (p) => {
        const idProp = p?.idProperty ?? p?.IdProperty ?? p?.id ?? p?.Id;
        const norm = {
          ...p,
          idProperty: idProp,
          name: p?.name ?? p?.Name ?? '',
          address: p?.address ?? p?.Address ?? '',
          price: p?.price ?? p?.Price ?? 0,
        };
        try {
          const resImg = await errorWrapper(
            api.get(`${propertyImageEndpoint}?idProperty=${idProp}${refresh ? '&refresh=true' : ''}`),
            { unwrap: false }
          );
          if (!resImg.ok) throw resImg.error;
          const imgBody = resImg.data || [];
          const imgItems = Array.isArray(imgBody)
            ? imgBody
            : (Array.isArray(imgBody.items) ? imgBody.items
              : (Array.isArray(imgBody.data) ? imgBody.data : []));
          const firstImg = imgItems[0];
          return { ...norm, image: firstImg || null };
        } catch {
          return { ...norm, image: null };
        }
      })
    );

    const finalMeta = meta || body.meta || { page, limit, total: withImages.length, last_page: 1 };
    return { items: withImages, meta: finalMeta };
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
