import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TodoItem from '../TodoItem';
import type { Todo } from '../../types/todo';

const mockTodo: Todo = {
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
};

const completedTodo: Todo = {
  id: '2',
  text: 'Completed todo',
  completed: true,
  createdAt: new Date('2023-01-01'),
};

const mockProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe('TodoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders todo text', () => {
      render(<TodoItem todo={mockTodo} {...mockProps} />);
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    it('renders unchecked checkbox for incomplete todo', () => {
      render(<TodoItem todo={mockTodo} {...mockProps} />);
      const checkbox = screen.getByRole('button', {
        name: /mark as complete/i,
      });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toHaveClass('completed');
    });

    it('renders checked checkbox for completed todo', () => {
      render(<TodoItem todo={completedTodo} {...mockProps} />);
      const checkbox = screen.getByRole('button', {
        name: /mark as incomplete/i,
      });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass('completed');
    });

    it('applies completed styling to completed todo text', () => {
      render(<TodoItem todo={completedTodo} {...mockProps} />);
      const todoText = screen.getByText('Completed todo');
      expect(todoText).toHaveClass('completed');
    });

    it('renders edit and delete buttons', () => {
      render(<TodoItem todo={mockTodo} {...mockProps} />);
      expect(
        screen.getByRole('button', { name: /edit todo/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /delete todo/i })
      ).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      const checkbox = screen.getByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkbox);

      expect(mockProps.onToggle).toHaveBeenCalledWith('1');
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith('1');
    });

    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel editing/i })
      ).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('shows edit form when in edit mode', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('saves changes when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Updated todo');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(mockProps.onEdit).toHaveBeenCalledWith('1', 'Updated todo');
    });

    it('saves changes when form is submitted', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Updated todo');
      await user.keyboard('{Enter}');

      expect(mockProps.onEdit).toHaveBeenCalledWith('1', 'Updated todo');
    });

    it('cancels edit when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Changed text');

      await user.click(screen.getByRole('button', { name: /cancel editing/i }));

      expect(screen.getByText('Test todo')).toBeInTheDocument();
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('cancels edit when escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Changed text');
      await user.keyboard('{Escape}');

      expect(screen.getByText('Test todo')).toBeInTheDocument();
      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('does not save empty text', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(mockProps.onEdit).not.toHaveBeenCalled();
    });

    it('trims whitespace when saving', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, '  Updated todo  ');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(mockProps.onEdit).toHaveBeenCalledWith('1', 'Updated todo');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      expect(
        screen.getByRole('button', { name: /mark as complete/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /edit todo/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /delete todo/i })
      ).toBeInTheDocument();
    });

    it('has proper tabindex attributes', () => {
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('has proper ARIA label for edit input', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /edit todo/i }));

      const input = screen.getByRole('textbox', { name: /edit todo text/i });
      expect(input).toBeInTheDocument();
    });
  });
});
