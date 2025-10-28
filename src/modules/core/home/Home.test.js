import { render, screen, act } from '@testing-library/react';
import { Home } from './Home';
import { api } from '../../../services/api/api';
import { useSelector } from 'react-redux';

// --- Estado mutable para el mock de useLocation ---
let mockLocationState = null;

// --- Mock router: expone los hooks y componentes mínimos ---
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  MemoryRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/home', state: mockLocationState }),
}));

// --- Mock react-redux: solo hooks (sin Providers) ---
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(),
}));

// --- Mock API: evita axios real/ESM y controla respuestas ---
jest.mock('../../../services/api/api', () => {
  const get = jest.fn();
  return { api: { get }, default: { get } };
});

describe('Home optimistic update flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;

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

  it('muestra el item optimista y lo mantiene tras fetch vacío; luego reconcilia', async () => {
    const optimistic = {
      action: 'created',
      property: { idProperty: 999, name: 'Casa Nueva', address: 'Calle 1', price: 1234 },
      image: { file: 'base64' },
    };

    // Primer fetch: servidor vacío
    api.get.mockImplementation((url) => {
      if (/propertyimage/i.test(url)) return Promise.resolve({ data: [] });
      if (/property/i.test(url)) return Promise.resolve({ data: { data: [], meta: { last_page: 1, page: 1, total: 0 } } });
      return Promise.resolve({ data: {} });
    });

    mockLocationState = { refetch: Date.now(), optimistic };
    render(<Home />);

    // Aparece de inmediato
    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();
    // Se mantiene tras la respuesta vacía
    expect(await screen.findByText('Casa Nueva')).toBeInTheDocument();

    // Segundo fetch (por focus): ahora el server sí trae el item
    api.get.mockImplementation((url) => {
      if (/propertyimage/i.test(url)) return Promise.resolve({ data: [] });
      if (/property/i.test(url)) return Promise.resolve({ data: { data: [optimistic.property], meta: { last_page: 1, page: 1, total: 1 } } });
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
          properties: [{ idProperty: 1, name: 'Depto Test', address: 'Calle 123', price: 1000, image: { file: 'abcd' } }],
          loading: false,
          meta: { last_page: 1 },
          error: null,
        },
      })
    );
    render(<Home />);
  };

  it('Admin: muestra saludo, rol, Editar y Eliminar', async () => {
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
