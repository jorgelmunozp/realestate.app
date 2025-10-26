import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';
import { errorWrapper } from '../../services/api/errorWrapper';

// ===========================================================
// 🔹 Endpoint desde variables de entorno (.env)
// ===========================================================
const ENDPOINT = process.env.REACT_APP_ENDPOINT_PROPERTY;

// ===========================================================
// 🔹 Obtener propiedades (con imagen incluida desde el backend)
// ===========================================================
export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async ({ page = 1, limit = 6, refresh = false } = {}) => {
    if (!ENDPOINT) throw new Error('Falta configuración: REACT_APP_ENDPOINT_PROPERTY');

    const url = `${ENDPOINT}?page=${page}&limit=${limit}${refresh ? '&refresh=true' : ''}`;
    const res = await errorWrapper(api.get(url, { __skipAuth: true }), { unwrap: false });
    if (!res.ok) throw res.error;

    const body = res.data || {};
    let items = [];
    let meta;

    // 🔹 Adaptar según formato del backend
    if (Array.isArray(body)) {
      items = body;
    } else if (Array.isArray(body.data)) {
      items = body.data;
      meta = body.meta;
    } else if (Array.isArray(body.items)) {
      items = body.items;
      meta = body.meta;
    } else if (body.data && typeof body.data === 'object' && Array.isArray(body.data.items)) {
      items = body.data.items;
      meta = body.data.meta || body.meta;
    }

    const finalMeta = meta || body.meta || { page, limit, total: items.length, last_page: 1 };

    // 🔹 Normalización ligera
    const normalized = items.map((p) => ({
      idProperty: p.idProperty ?? p.IdProperty ?? p.id ?? p.Id ?? '',
      name: p.name ?? p.Name ?? '',
      address: p.address ?? p.Address ?? '',
      price: p.price ?? p.Price ?? 0,
      year: p.year ?? p.Year ?? 0,
      codeInternal: p.codeInternal ?? p.CodeInternal ?? 0,
      idOwner: p.idOwner ?? p.IdOwner ?? '',
      image: p.image ?? p.Image ?? null,
    }));

    return { items: normalized, meta: finalMeta };
  }
);

// ===========================================================
// 🔹 Crear propiedad
// ===========================================================
export const createProperty = createAsyncThunk(
  'property/create',
  async (propertyData) => {
    if (!ENDPOINT) throw new Error('Falta configuración: REACT_APP_ENDPOINT_PROPERTY');

    const res = await api.post(ENDPOINT, propertyData);
    return res.data;
  }
);

// ===========================================================
// 🔹 Slice principal
// ===========================================================
const propertySlice = createSlice({
  name: 'property',
  initialState: {
    properties: [],
    meta: { page: 1, limit: 6, total: 0, last_page: 1 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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
