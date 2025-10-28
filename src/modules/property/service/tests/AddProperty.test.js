import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../../../test/renderWithRouter';
import { AddProperty } from '../AddProperty';
import { usePost } from '../../../../services/fetch/usePost';

jest.mock('../../../../services/fetch/usePost');

beforeEach(()=>jest.clearAllMocks());

it('envía formulario mínimo', () => {
  const mockMutate = jest.fn();
  usePost.mockReturnValue({ loading:false, error:null, mutate:mockMutate });
  renderWithRouter(<AddProperty/>);
  const name = screen.getByLabelText(/nombre/i, { selector:'input' });
  const price = screen.getByLabelText(/precio/i, { selector:'input' });
  fireEvent.change(name, { target:{ value:'Casa X' }});
  fireEvent.change(price, { target:{ value:'100000' }});
  fireEvent.click(screen.getByRole('button', { name:/guardar/i }));
  expect(mockMutate).toHaveBeenCalled();
});
