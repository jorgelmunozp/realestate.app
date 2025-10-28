import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../services/store/store';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleRoute } from '../RoleRoute';
import { __getNavigateMock } from 'react-router-dom';

describe('RoleRoute', () => {
  beforeEach(() => __getNavigateMock().mockReset());

  it('bloquea acceso y redirige si no tiene rol', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleRoute roles={['admin']}>
                  <div data-testid="admin-page">Admin</div>
                </RoleRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(__getNavigateMock()).toHaveBeenCalledWith('/login');
  });
});
