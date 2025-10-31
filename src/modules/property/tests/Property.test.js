import { render, screen } from '@testing-library/react';
import Property from '../Property';
import { Provider } from 'react-redux';
import { store } from '../../../services/store/store';
import { MemoryRouter } from 'react-router-dom';
import { __setParamsMock } from 'react-router-dom';

describe('Property', () => {
  beforeEach(() => __setParamsMock({ id: 'abc123' }));

  it('muestra la propiedad según el id', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Property />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('property-view')).toBeInTheDocument();
  });
});
