import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home } from './Home';
import { api } from '../../../services/api/api';

// Mock react-redux: solo hooks (sin Providers)
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(),
}));

// Mock API: evita axios real/ESM y controla respuestas
jest.mock('../../../services/api/api', () => {
  const get = jest.fn();
  return { api: { get }, default: { get } };
});

// util para montar Home con estado de ruta (state)
const renderHome = (initialState) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/home', state: initialState }]}>
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

describe('Home optimistic update flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Estado redux por defecto
    useSelector.mockImplementation((sel) =>
      sel({
        auth: { user: { logged: true, name: 'Tester', role: 'admin' } },
        property: { properties: [], loading: false, meta: { last_page: 1 }, error: null },
      })
    );

    // userId en sesión para evitar redirects
    jest.spyOn(window.sessionStorage.__proto__, 'getItem')
      .mockImplementation((k) => (k === 'userId' ? '1' : null));
    jest.spyOn(window.sessionStorage.__proto__, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('muestra el item optimista, se mantiene con fetch vacío y reconcilia tras focus', async () => {
    const optimistic = {
      action: 'created',
      property: { idProperty: 999, name: 'Casa Nueva', address: 'Calle 1', price: 1234 },
      image: { file: 'base64' },
    };

    // Primer fetch: servidor vacío
    api.get.mockImplementation((url) => {
      if (/propertyimage/i.test(url)) return Promise.resolve({ data: [] });
      if (/property\b(?!image)/i.test(url))
        return Promise.resolve({ data: { data: [], meta: { last_page: 1, page: 1, total: 0 } } });
      return Promise.resolve({ data: {} });
    });

    renderHome({ refetch: Date.now(), optimistic });

    // Aparece de inmediato y se mantiene tras fetch vacío
    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();
    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();

    // Segundo fetch (por focus): ahora el server trae el item
    api.get.mockImplementation((url) => {
      if (/propertyimage/i.test(url)) return Promise.resolve({ data: [] });
      if (/property\b(?!image)/i.test(url))
        return Promise.resolve({
          data: { data: [optimistic.property], meta: { last_page: 1, page: 1, total: 1 } },
        });
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();
  });
});

describe('Home role-based actions and greeting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window.sessionStorage.__proto__, 'getItem')
      .mockImplementation((k) => (k === 'userId' ? '1' : null));
    jest.spyOn(window.sessionStorage.__proto__, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  const mountWithUser = (user) => {
    useSelector.mockImplementation((sel) =>
      sel({
        auth: { user: { logged: true, ...user } },
        property: {
          properties: [
            { idProperty: 1, name: 'Depto Test', address: 'Calle 123', price: 1000, image: { file: 'abcd' } },
          ],
          loading: false,
          meta: { last_page: 1 },
          error: null,
        },
      })
    );
    return renderHome(null);
  };

  it('Admin: saludo, rol, Editar y Eliminar', async () => {
    mountWithUser({ name: 'Jorge Pérez', role: 'admin' });
    expect(await screen.findByText(/hola\s+Jorge/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getAllByTitle('Editar')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Eliminar')[0]).toBeInTheDocument();
  });

  it('Editor: saludo y Editar, sin Eliminar', async () => {
    mountWithUser({ name: 'María', role: 'editor' });
    expect(await screen.findByText(/hola\s+María/i)).toBeInTheDocument();
    expect(screen.getByText(/Editor/i)).toBeInTheDocument();
    expect(screen.getAllByTitle('Editar')[0]).toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar')).toBeNull();
  });

  it('User: saludo y sin acciones', async () => {
    mountWithUser({ name: 'Carlos', role: 'user' });
    expect(await screen.findByText(/hola\s+Carlos/i)).toBeInTheDocument();
    expect(screen.getByText(/User/i)).toBeInTheDocument();
    expect(screen.queryByTitle('Editar')).toBeNull();
    expect(screen.queryByTitle('Eliminar')).toBeNull();
  });
});
