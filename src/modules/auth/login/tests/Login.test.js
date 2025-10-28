import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';
import { Provider } from 'react-redux';
import { store } from '../../../services/store/store';
import { MemoryRouter } from 'react-router-dom';
import { __getNavigateMock, __setLocationMock } from 'react-router-dom';

describe('Login', () => {
  beforeEach(() => {
    __getNavigateMock().mockReset();
    __setLocationMock({ pathname: '/login', search: '' });
  });

  it('navega al dashboard tras login exitoso', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    // tu lógica de espera/mocks...
    expect(__getNavigateMock()).toHaveBeenCalledWith('/dashboard');
  });
});
