import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders todo list application', () => {
    render(<App />);
    const heading = screen.getByText(/todo list/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders add todo input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    expect(input).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /add todo/i });
    expect(addButton).toBeInTheDocument();
  });
});
