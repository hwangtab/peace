import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app navigation title', () => {
  render(<App />);
  expect(screen.getAllByText('강정피스앤뮤직캠프').length).toBeGreaterThan(0);
});
