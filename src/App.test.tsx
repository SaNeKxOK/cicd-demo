import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders Vite + React heading', () => {
    render(<App />);
    const heading = screen.getByText(/vite \+ react/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders learn more text', () => {
    render(<App />);
    const learnMore = screen.getByText(
      /click on the vite and react logos to learn more/i
    );
    expect(learnMore).toBeInTheDocument();
  });
});
