import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TodoList from '../TodoList';

// Mock crypto.randomUUID for consistent test IDs
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(
      () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    ),
  },
});

describe('TodoList - Simplified Tests', () => {
  describe('Core functionality', () => {
    it('renders correctly and allows adding todos', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Check initial render
      expect(
        screen.getByRole('heading', { name: /todo list/i })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/what needs to be done/i)
      ).toBeInTheDocument();

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    it('allows toggling todo completion', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Toggle test{Enter}');

      // Toggle completion
      const checkbox = screen.getByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkbox);

      expect(
        screen.getByRole('button', { name: /mark as incomplete/i })
      ).toBeInTheDocument();
    });

    it('allows editing todos', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Edit test{Enter}');

      // Edit the todo
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Edit test');
      await user.clear(editInput);
      await user.type(editInput, 'Edited todo');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText('Edited todo')).toBeInTheDocument();
    });

    it('allows deleting todos', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Delete test{Enter}');

      // Delete the todo
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      expect(screen.queryByText('Delete test')).not.toBeInTheDocument();
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });

    it('shows filter buttons when todos exist', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Filter test{Enter}');

      // Check filter buttons appear
      expect(
        screen.getByRole('button', { name: /show all todos/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /show active todos/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /show completed todos/i })
      ).toBeInTheDocument();
    });

    it('shows bulk actions when todos exist', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Bulk test{Enter}');

      // Check bulk action appears
      expect(screen.getByText(/check all/i)).toBeInTheDocument();
    });

    it('shows correct task statistics', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add todos
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Task 1{Enter}');
      await user.type(input, 'Task 2{Enter}');

      // Check stats
      expect(screen.getByText(/2 of 2 tasks remaining/i)).toBeInTheDocument();

      // Complete one
      const checkbox = screen.getAllByRole('button', {
        name: /mark as complete/i,
      })[0];
      await user.click(checkbox);

      expect(screen.getByText(/1 of 2 tasks remaining/i)).toBeInTheDocument();
    });

    it('handles empty input correctly', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      // Try empty input
      await user.click(addButton);
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();

      // Try whitespace only
      await user.type(input, '   ');
      await user.click(addButton);
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });

    it('allows canceling edit with escape key', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Cancel test{Enter}');

      // Start editing
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Cancel test');
      await user.clear(editInput);
      await user.type(editInput, 'Changed text');
      await user.keyboard('{Escape}');

      expect(screen.getByText('Cancel test')).toBeInTheDocument();
    });

    it('requires non-empty text when editing', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add a todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Empty test{Enter}');

      // Start editing
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Empty test');
      await user.clear(editInput);
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Should still be in edit mode
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });
  });
});
