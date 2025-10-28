// src/modules/core/Index.test.jsx (ajusta la ruta según tu estructura)
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../services/store/store'; // <- ajusta si tu test vive en otra carpeta
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Index from './Index';

describe('Index', () => {
  it('renderiza el listado', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Inmuebles Disponibles/i)).toBeInTheDocument();
  });
});
