import { render, screen } from '@testing-library/react';
import App from './App';

test('renders auth title', () => {
  render(<App />);
  const title = screen.getByText(/зоомагазин/i);
  expect(title).toBeInTheDocument();
});
