import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';

// Provide a mutable location state for the mock
let mockLocationState = null;

// Mock react-router-dom hooks used by Home
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/home', state: mockLocationState }),
}), { virtual: true });

// Mock API instance
jest.mock('../../../services/api/api', () => {
  const get = jest.fn();
  return { api: { get }, default: { get } };
});
import { api } from '../../../services/api/api';

import { Home } from './Home';

describe('Home optimistic update flow', () => {
  const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
  const imageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

  beforeEach(() => {
    // userId present to avoid redirect
    jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementation((k) => (k === 'userId' ? '1' : null));
    jest.spyOn(window.sessionStorage.__proto__, 'setItem').mockImplementation(() => {});
    jest.spyOn(window, 'addEventListener').mockImplementation((type, cb) => {});
    jest.spyOn(window, 'removeEventListener').mockImplementation((type, cb) => {});
    api.get.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows optimistic item immediately and keeps it on server fetch without it', async () => {
    const optimistic = {
      action: 'created',
      property: { idProperty: 999, name: 'Casa Nueva', address: 'Calle 1', price: 1234 },
      image: { file: 'base64' },
    };

    // First fetch: server returns empty list
    api.get.mockImplementation((url) => {
      if (url.startsWith(`${propertyEndpoint}`)) {
        return Promise.resolve({ data: { data: [], meta: { last_page: 1, page: 1, total: 0 } } });
      }
      if (url.startsWith(`${imageEndpoint}`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    mockLocationState = { refetch: Date.now(), optimistic };
    render(<Home />);

    // Optimistic card should appear immediately
    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();

    // After server fetch returns empty, the optimistic item should still be present
    await waitFor(() => expect(screen.getByText('Casa Nueva')).toBeInTheDocument());

    // Now simulate a focus-triggered refetch where server includes the item
    api.get.mockImplementation((url) => {
      if (url.startsWith(`${propertyEndpoint}`)) {
        return Promise.resolve({ data: { data: [optimistic.property], meta: { last_page: 1, page: 1, total: 1 } } });
      }
      if (url.startsWith(`${imageEndpoint}`)) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    // Trigger focus event to refetch silently
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    // Item remains visible after reconcile
    await waitFor(() => expect(screen.getByText('Casa Nueva')).toBeInTheDocument());
  });
});

describe('Home role-based actions and greeting', () => {
  const { useSelector, useDispatch } = require('react-redux');
  const tokenSvc = require('../../../services/auth/token');

  beforeEach(() => {
    // Ensure session userId exists to avoid redirect
    jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementation((k) => (k === 'userId' ? '1' : null));
    jest.spyOn(window.sessionStorage.__proto__, 'setItem').mockImplementation(() => {});

    // Mock dispatch as no-op
    if (useDispatch && jest.isMockFunction(useDispatch)) {
      useDispatch.mockReturnValue(jest.fn());
    } else {
      jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(jest.fn());
    }

    // Default token mocks
    jest.spyOn(tokenSvc, 'getTokenPayload').mockReturnValue({});
    jest.spyOn(tokenSvc, 'getUserFromToken').mockReturnValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const propertyItem = {
    idProperty: 1,
    name: 'Depto Test',
    address: 'Calle 123',
    price: 1000,
    image: { file: 'abcd' },
  };

  const mountWithState = (user) => {
    const state = {
      property: { properties: [propertyItem], loading: false, meta: { last_page: 1 } },
      auth: { user: { logged: true, ...user } },
    };
    const rr = require('react-redux');
    jest.spyOn(rr, 'useSelector').mockImplementation((sel) => sel(state));
    render(<Home />);
  };

  it('shows edit and delete for Admin and greeting/role', async () => {
    mountWithState({ name: 'Jorge Pérez', role: 'admin' });

    // Greeting and role
    expect(await screen.findByText(/hola\s+Jorge/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();

    // Action buttons
    expect(screen.getAllByTitle('Editar')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Eliminar')[0]).toBeInTheDocument();
  });

  it('shows only edit for Editor (no delete)', async () => {
    mountWithState({ name: 'María', role: 'editor' });

    expect(await screen.findByText(/hola\s+María/i)).toBeInTheDocument();
    expect(screen.getByText(/Editor/i)).toBeInTheDocument();

    expect(screen.getAllByTitle('Editar')[0]).toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar')).toBeNull();
  });

  it('hides edit and delete for regular user', async () => {
    mountWithState({ name: 'Carlos', role: 'user' });

    expect(await screen.findByText(/hola\s+Carlos/i)).toBeInTheDocument();
    expect(screen.getByText(/User/i)).toBeInTheDocument();

    expect(screen.queryByTitle('Editar')).toBeNull();
    expect(screen.queryByTitle('Eliminar')).toBeNull();
  });
});
