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
