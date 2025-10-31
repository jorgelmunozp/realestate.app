import { renderWithRouter } from '../../test/renderWithRouter';
import { screen } from '@testing-library/react';
import { PrivateRoute } from '../PrivateRoute';

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (sel) => mockUseSelector(sel),
  useDispatch: () => jest.fn()
}));

// Importa DESPUÉS del mock
afterEach(() => jest.clearAllMocks());

test('bloquea cuando no está logueado', () => {
  mockUseSelector.mockReturnValue({ user:{ logged:false } }); // state.auth
  renderWithRouter(<PrivateRoute><div>Privado</div></PrivateRoute>, { route:'/dashboard' });
  expect(screen.queryByText('Privado')).not.toBeInTheDocument();
});

test('permite cuando está logueado', () => {
  mockUseSelector.mockReturnValue({ user:{ logged:true } });
  renderWithRouter(<PrivateRoute><div>Privado</div></PrivateRoute>, { route:'/dashboard' });
  expect(screen.getByText('Privado')).toBeInTheDocument();
});
