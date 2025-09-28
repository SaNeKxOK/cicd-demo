import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock crypto.randomUUID for consistent test IDs
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(
      () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    ),
  },
});

describe('Todo App Integration Tests', () => {
  describe('Complete todo workflow', () => {
    it('allows users to add, edit, complete, and delete todos', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Initial state
      expect(screen.getByText(/todo list/i)).toBeInTheDocument();
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();

      // Add first todo
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Learn React{Enter}');

      expect(screen.getByText('Learn React')).toBeInTheDocument();
      expect(screen.getByText(/1 of 1 tasks remaining/i)).toBeInTheDocument();
      expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();

      // Add second todo
      await user.type(input, 'Write tests{Enter}');
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.getByText(/2 of 2 tasks remaining/i)).toBeInTheDocument();

      // Complete first todo
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[0]);

      expect(screen.getByText(/1 of 2 tasks remaining/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /mark as incomplete/i })
      ).toBeInTheDocument();

      // Edit second todo
      const editButtons = screen.getAllByRole('button', { name: /edit todo/i });
      await user.click(editButtons[1]); // Edit "Write tests"

      const editInput = screen.getByDisplayValue('Write tests');
      await user.clear(editInput);
      await user.type(editInput, 'Write comprehensive tests');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText('Write comprehensive tests')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();

      // Delete completed todo
      const deleteButtons = screen.getAllByRole('button', {
        name: /delete todo/i,
      });
      await user.click(deleteButtons[0]); // Delete "Learn React"

      expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
      expect(screen.getByText('Write comprehensive tests')).toBeInTheDocument();
      expect(screen.getByText(/1 of 1 tasks remaining/i)).toBeInTheDocument();
    });

    it('handles filtering workflow correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add multiple todos
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');
      await user.type(input, 'Todo 3{Enter}');

      // Verify all todos are visible
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();

      // Complete one todo
      const firstCheckbox = screen.getAllByRole('button', {
        name: /mark as complete/i,
      })[0];
      await user.click(firstCheckbox);

      // Filter to active todos
      await user.click(
        screen.getByRole('button', { name: /show active todos/i })
      );

      expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();

      // Filter to completed todos
      await user.click(
        screen.getByRole('button', { name: /show completed todos/i })
      );

      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();

      // Back to all todos
      await user.click(screen.getByRole('button', { name: /show all todos/i }));

      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();
    });

    it('handles bulk actions workflow', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add multiple todos
      await user.type(input, 'Bulk todo 1{Enter}');
      await user.type(input, 'Bulk todo 2{Enter}');
      await user.type(input, 'Bulk todo 3{Enter}');

      expect(screen.getByText(/3 of 3 tasks remaining/i)).toBeInTheDocument();

      // Mark all as complete
      await user.click(
        screen.getByRole('button', { name: /mark all as complete/i })
      );

      expect(screen.getByText(/0 of 3 tasks remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/uncheck all/i)).toBeInTheDocument();
      expect(screen.getByText(/clear completed \(3\)/i)).toBeInTheDocument();

      // Uncheck all
      await user.click(
        screen.getByRole('button', { name: /mark all as incomplete/i })
      );

      expect(screen.getByText(/3 of 3 tasks remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/check all/i)).toBeInTheDocument();
      expect(screen.queryByText(/clear completed/i)).not.toBeInTheDocument();

      // Complete some and clear completed
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      expect(screen.getByText(/1 of 3 tasks remaining/i)).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /clear completed todos/i })
      );

      expect(screen.getByText(/1 of 1 tasks remaining/i)).toBeInTheDocument();
      expect(screen.getByText('Bulk todo 3')).toBeInTheDocument();
      expect(screen.queryByText('Bulk todo 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Bulk todo 2')).not.toBeInTheDocument();
    });

    it('maintains state consistency during complex interactions', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add todos
      await user.type(input, 'State test 1{Enter}');
      await user.type(input, 'State test 2{Enter}');

      // Edit while filtering
      const editButton = screen.getAllByRole('button', {
        name: /edit todo/i,
      })[0];
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('State test 1');
      await user.clear(editInput);
      await user.type(editInput, 'Edited state test 1');

      // Switch filter while editing
      await user.click(
        screen.getByRole('button', { name: /show active todos/i })
      );

      // Complete edit
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText('Edited state test 1')).toBeInTheDocument();

      // Complete the edited todo
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[0]);

      // Should still show the remaining active todo
      expect(screen.getByText('State test 2')).toBeInTheDocument();

      // Switch to completed filter
      await user.click(
        screen.getByRole('button', { name: /show completed todos/i })
      );
      expect(screen.getByText('Edited state test 1')).toBeInTheDocument();

      // Back to all
      await user.click(screen.getByRole('button', { name: /show all todos/i }));
      expect(screen.getByText('Edited state test 1')).toBeInTheDocument();
      expect(screen.getByText('State test 2')).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles empty input gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      // Try to add empty todo
      await user.click(addButton);
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();

      // Try with only whitespace
      await user.type(input, '   ');
      await user.click(addButton);
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });

    it('handles edit cancellation properly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Original text{Enter}');

      // Start editing
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Original text');
      await user.clear(editInput);
      await user.type(editInput, 'Changed text');

      // Cancel edit
      await user.click(screen.getByRole('button', { name: /cancel editing/i }));

      expect(screen.getByText('Original text')).toBeInTheDocument();
      expect(screen.queryByText('Changed text')).not.toBeInTheDocument();
    });

    it('handles edit with empty text', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      // Start editing
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Test todo');
      await user.clear(editInput);

      // Try to save empty text
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Should still be in edit mode
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /edit todo text/i })
      ).toHaveValue('');
    });

    it('preserves todo order correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add todos in order
      await user.type(input, 'First todo{Enter}');
      await user.type(input, 'Second todo{Enter}');
      await user.type(input, 'Third todo{Enter}');

      const todoTexts = screen.getAllByText(/todo$/);
      expect(todoTexts[0]).toHaveTextContent('First todo');
      expect(todoTexts[1]).toHaveTextContent('Second todo');
      expect(todoTexts[2]).toHaveTextContent('Third todo');

      // Complete middle todo
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[1]);

      // Order should be preserved
      const updatedTodoTexts = screen.getAllByText(/todo$/);
      expect(updatedTodoTexts[0]).toHaveTextContent('First todo');
      expect(updatedTodoTexts[1]).toHaveTextContent('Second todo');
      expect(updatedTodoTexts[2]).toHaveTextContent('Third todo');
    });
  });
});
