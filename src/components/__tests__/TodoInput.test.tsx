import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TodoInput from '../TodoInput';

const mockOnAddTodo = vi.fn();

describe('TodoInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders input and add button', () => {
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      expect(
        screen.getByPlaceholderText(/what needs to be done/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add todo/i })
      ).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button', { name: /add todo/i });

      expect(input).toHaveAttribute('aria-label', 'Add new todo');
      expect(button).toHaveAttribute('aria-label', 'Add todo');
    });
  });

  describe('adding todos', () => {
    it('calls onAddTodo when form is submitted with text', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'New todo');
      await user.click(screen.getByRole('button', { name: /add todo/i }));

      expect(mockOnAddTodo).toHaveBeenCalledWith('New todo');
      expect(mockOnAddTodo).toHaveBeenCalledTimes(1);
    });

    it('calls onAddTodo when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'New todo{Enter}');

      expect(mockOnAddTodo).toHaveBeenCalledWith('New todo');
      expect(mockOnAddTodo).toHaveBeenCalledTimes(1);
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'New todo{Enter}');

      expect(input).toHaveValue('');
    });

    it('trims whitespace from todo text', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, '   Spaced todo   {Enter}');

      expect(mockOnAddTodo).toHaveBeenCalledWith('Spaced todo');
    });

    it('does not call onAddTodo for empty input', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const button = screen.getByRole('button', { name: /add todo/i });
      await user.click(button);

      expect(mockOnAddTodo).not.toHaveBeenCalled();
    });

    it('does not call onAddTodo for whitespace-only input', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, '   ');
      await user.click(screen.getByRole('button', { name: /add todo/i }));

      expect(mockOnAddTodo).not.toHaveBeenCalled();
    });

    it('does not clear input for invalid submission', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, '   ');
      await user.click(screen.getByRole('button', { name: /add todo/i }));

      expect(input).toHaveValue('   ');
    });
  });

  describe('input behavior', () => {
    it('updates input value as user types', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Typing test');

      expect(input).toHaveValue('Typing test');
    });

    it('allows editing and resubmitting', async () => {
      const user = userEvent.setup();
      render(<TodoInput onAddTodo={mockOnAddTodo} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // First submission
      await user.type(input, 'First todo{Enter}');
      expect(mockOnAddTodo).toHaveBeenCalledWith('First todo');
      expect(input).toHaveValue('');

      // Second submission
      await user.type(input, 'Second todo{Enter}');
      expect(mockOnAddTodo).toHaveBeenCalledWith('Second todo');
      expect(mockOnAddTodo).toHaveBeenCalledTimes(2);
    });
  });
});
