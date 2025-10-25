import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock AppRouter to avoid pulling in react-router-dom in this unit smoke test
jest.mock('./routers/AppRouter', () => ({
  __esModule: true,
  AppRouter: () => <div data-testid="app-router">AppRouter</div>,
  default: () => <div data-testid="app-router">AppRouter</div>,
}));

import App from './App';

test('renders App with mocked router', () => {
  render(<App />);
  expect(screen.getByTestId('app-router')).toBeInTheDocument();
});
