import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../Register';
import { Provider } from 'react-redux';
import { store } from '../../../services/store/store';
import { MemoryRouter } from 'react-router-dom';
import { __getNavigateMock } from 'react-router-dom';

describe('Register', () => {
  beforeEach(() => __getNavigateMock().mockReset());

  it('redirige a /login tras registro', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );

    // completa el formulario y envía...
    expect(__getNavigateMock()).toHaveBeenCalledWith('/login');
  });
});
