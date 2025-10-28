import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../services/store/store';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardRoutes from '../DashboardRoutes';

test('renderiza dashboard home', () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/*" element={<DashboardRoutes />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
});
