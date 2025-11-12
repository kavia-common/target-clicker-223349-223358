import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Click Quest header and controls', () => {
  render(<App />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByText('Click Quest')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});
