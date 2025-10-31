import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/api';
import { errorWrapper } from '../../services/api/errorWrapper';

const ENDPOINT = process.env.REACT_APP_ENDPOINT_PROPERTY;

export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async ({
    page = 1,
    limit = 6,
    name = '',
    address = '',
    minPrice = '',
    maxPrice = '',
    refresh = false
  } = {}) => {
    if (!ENDPOINT) throw new Error('Falta configuración: REACT_APP_ENDPOINT_PROPERTY');

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (name && name.trim() !== '') params.append('name', name.trim());
    if (address && address.trim() !== '') params.append('address', address.trim());
    if (minPrice !== '' && minPrice !== null) params.append('minPrice', minPrice);
    if (maxPrice !== '' && maxPrice !== null) params.append('maxPrice', maxPrice);
    if (refresh) params.append('refresh', 'true');

    const url = `${ENDPOINT}?${params.toString()}`;

    const res = await errorWrapper(api.get(url, { __skipAuth: true }), { unwrap: false });
    if (!res.ok) throw res.error;

    const body = res.data || {};
    let items = [];
    let meta = {};

    if (body?.data?.data && Array.isArray(body.data.data)) {
      items = body.data.data;
      meta = body.data.meta || {};
    } else if (Array.isArray(body?.data)) {
      items = body.data;
      meta = body.meta || {};
    } else if (Array.isArray(body)) {
      items = body;
      meta = {};
    }

    const finalMeta = meta || { page, limit, total: items.length, last_page: 1 };

    const normalized = items.map((p) => ({
      idProperty: p.idProperty ?? p.IdProperty ?? p.id ?? '',
      name: p.name ?? p.Name ?? '',
      address: p.address ?? p.Address ?? '',
      price: Number(p.price ?? p.Price ?? 0),
      year: Number(p.year ?? p.Year ?? 0),
      codeInternal: Number(p.codeInternal ?? p.CodeInternal ?? 0),
      idOwner: p.idOwner ?? p.IdOwner ?? '',
      image: p.image ?? p.Image ?? null,
      owner: p.owner ?? null,
      traces: p.traces ?? [],
    }));

    return {
      items: normalized,
      meta: finalMeta,
      filters: {                    // guarda filtros actuales en el state
        name: name?.trim() || '',
        address: address?.trim() || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
      }
    };
  }
);

export const createProperty = createAsyncThunk(
  'property/create',
  async (propertyData) => {
    if (!ENDPOINT) throw new Error('Falta configuración: REACT_APP_ENDPOINT_PROPERTY');
    const res = await errorWrapper(api.post(ENDPOINT, propertyData));
    return res.data?.data ?? res.data;
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState: {
    properties: [],
    meta: { page: 1, limit: 6, total: 0, last_page: 1 },
    loading: false,
    error: null,
    filters: {
      name: '',
      address: '',
      minPrice: '',
      maxPrice: '',
    },
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
        state.filters = action.payload.filters || state.filters;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        if (action.payload) state.properties.push(action.payload);
      });
  },
});

export default propertySlice.reducer;
