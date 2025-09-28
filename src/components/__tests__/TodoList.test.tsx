import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TodoList from '../TodoList';

// Mock crypto.randomUUID for consistent test IDs
let todoIdCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => `test-uuid-${++todoIdCounter}`),
  },
});

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    todoIdCounter = 0; // Reset counter for each test
  });

  describe('initial render', () => {
    it('renders the todo list title', () => {
      render(<TodoList />);
      expect(
        screen.getByRole('heading', { name: /todo list/i })
      ).toBeInTheDocument();
    });

    it('renders the add todo form', () => {
      render(<TodoList />);
      expect(
        screen.getByPlaceholderText(/what needs to be done/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add todo/i })
      ).toBeInTheDocument();
    });

    it('shows empty state when no todos', () => {
      render(<TodoList />);
      expect(
        screen.getByText(/no todos yet\. add one above!/i)
      ).toBeInTheDocument();
    });

    it('does not show filter buttons when no todos', () => {
      render(<TodoList />);
      expect(screen.queryByText(/all \(/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/active \(/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/completed \(/i)).not.toBeInTheDocument();
    });

    it('does not show bulk actions when no todos', () => {
      render(<TodoList />);
      expect(screen.queryByText(/check all/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/clear completed/i)).not.toBeInTheDocument();
    });

    it('does not show stats when no todos', () => {
      render(<TodoList />);
      expect(screen.queryByText(/tasks remaining/i)).not.toBeInTheDocument();
    });
  });

  describe('adding todos', () => {
    it('adds a new todo when form is submitted', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      await user.type(input, 'New todo item');
      await user.click(addButton);

      expect(screen.getByText('New todo item')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('adds a new todo when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      await user.type(input, 'New todo item{Enter}');

      expect(screen.getByText('New todo item')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('does not add empty todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const addButton = screen.getByRole('button', { name: /add todo/i });
      await user.click(addButton);

      expect(
        screen.getByText(/no todos yet\. add one above!/i)
      ).toBeInTheDocument();
    });

    it('trims whitespace from todo text', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      await user.type(input, '  Trimmed todo  {Enter}');

      expect(screen.getByText('Trimmed todo')).toBeInTheDocument();
    });

    it('shows filter buttons after adding first todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'First todo{Enter}');

      expect(screen.getByText('All (1)')).toBeInTheDocument();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (0)')).toBeInTheDocument();
    });

    it('shows bulk actions after adding first todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'First todo{Enter}');

      expect(screen.getByText(/check all/i)).toBeInTheDocument();
    });

    it('shows stats after adding first todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'First todo{Enter}');

      expect(screen.getByText(/1 of 1 tasks remaining/i)).toBeInTheDocument();
    });
  });

  describe('todo interactions', () => {
    it('sets up fresh state for interactions', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      expect(screen.getByText('Test todo')).toBeInTheDocument();

      // Test toggle functionality
      const checkbox = screen.getByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkbox);

      expect(
        screen.getByRole('button', { name: /mark as incomplete/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/0 of 1 tasks remaining/i)).toBeInTheDocument();
    });

    it('deletes todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo to delete{Enter}');

      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      expect(screen.queryByText('Test todo to delete')).not.toBeInTheDocument();
      expect(
        screen.getByText(/no todos yet\. add one above!/i)
      ).toBeInTheDocument();
    });

    it('edits todo', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo to edit{Enter}');

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const editInput = screen.getByDisplayValue('Test todo to edit');
      await user.clear(editInput);
      await user.type(editInput, 'Updated todo');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText('Updated todo')).toBeInTheDocument();
      expect(screen.queryByText('Test todo to edit')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('shows all todos by default and filters correctly', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add multiple todos
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Active todo 1{Enter}');
      await user.type(input, 'Active todo 2{Enter}');
      await user.type(input, 'Todo to complete{Enter}');

      // All should be visible initially
      expect(screen.getByText('Active todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo to complete')).toBeInTheDocument();

      // Complete one todo
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[2]);

      // Filter to active todos
      const activeFilter = screen.getByRole('button', {
        name: /show active todos/i,
      });
      await user.click(activeFilter);

      expect(screen.getByText('Active todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active todo 2')).toBeInTheDocument();
      expect(screen.queryByText('Todo to complete')).not.toBeInTheDocument();

      // Filter to completed todos
      const completedFilter = screen.getByRole('button', {
        name: /show completed todos/i,
      });
      await user.click(completedFilter);

      expect(screen.queryByText('Active todo 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Active todo 2')).not.toBeInTheDocument();
      expect(screen.getByText('Todo to complete')).toBeInTheDocument();
    });

    it('shows appropriate message when no todos match filter', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add todos and complete all of them
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');

      // Complete all todos
      const checkboxes = screen.getAllByRole('button', {
        name: /mark as complete/i,
      });
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Filter to active todos - should show no active message
      const activeFilter = screen.getByRole('button', {
        name: /show active todos/i,
      });
      await user.click(activeFilter);

      expect(screen.getByText(/no active todos/i)).toBeInTheDocument();
    });

    it('updates filter button appearance', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      const activeFilter = screen.getByRole('button', {
        name: /show active todos/i,
      });
      await user.click(activeFilter);

      expect(activeFilter).toHaveClass('active');
      expect(
        screen.getByRole('button', { name: /show all todos/i })
      ).not.toHaveClass('active');
    });
  });

  describe('bulk actions', () => {
    it('marks all todos as complete', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add multiple todos
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');
      await user.type(input, 'Todo 3{Enter}');

      const checkAllButton = screen.getByRole('button', {
        name: /mark all as complete/i,
      });
      await user.click(checkAllButton);

      expect(screen.getByText(/0 of 3 tasks remaining/i)).toBeInTheDocument();
    });

    it('shows clear completed button and clears completed todos', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add multiple todos
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');
      await user.type(input, 'Todo 3{Enter}');

      // Complete one todo
      const checkbox = screen.getAllByRole('button', {
        name: /mark as complete/i,
      })[0];
      await user.click(checkbox);

      // Should show clear completed button
      expect(
        screen.getByRole('button', { name: /clear completed todos/i })
      ).toBeInTheDocument();

      // Clear completed
      const clearButton = screen.getByRole('button', {
        name: /clear completed todos/i,
      });
      await user.click(clearButton);

      expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();
      expect(screen.getByText(/2 of 2 tasks remaining/i)).toBeInTheDocument();
    });

    it('updates button text based on completion state', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      // Add multiple todos
      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');

      expect(screen.getByText(/check all/i)).toBeInTheDocument();

      // Mark all as complete
      const checkAllButton = screen.getByRole('button', {
        name: /mark all as complete/i,
      });
      await user.click(checkAllButton);

      expect(screen.getByText(/uncheck all/i)).toBeInTheDocument();
    });
  });

  describe('statistics', () => {
    it('shows correct task counts', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add 3 todos
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');
      await user.type(input, 'Todo 3{Enter}');

      expect(screen.getByText(/3 of 3 tasks remaining/i)).toBeInTheDocument();

      // Complete 1 todo
      const checkbox = screen.getAllByRole('button', {
        name: /mark as complete/i,
      })[0];
      await user.click(checkbox);

      expect(screen.getByText(/2 of 3 tasks remaining/i)).toBeInTheDocument();
    });

    it('updates filter counts correctly', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);

      // Add 2 todos
      await user.type(input, 'Todo 1{Enter}');
      await user.type(input, 'Todo 2{Enter}');

      // Check initial counts
      expect(
        screen.getByText((content) => content.includes('All (2)'))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes('Active (2)'))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes('Completed (0)'))
      ).toBeInTheDocument();

      // Complete 1 todo
      const checkbox = screen.getAllByRole('button', {
        name: /mark as complete/i,
      })[0];
      await user.click(checkbox);

      // Check updated counts
      expect(
        screen.getByText((content) => content.includes('All (2)'))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes('Active (1)'))
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /show completed todos/i })
      ).toHaveTextContent('Completed (1)');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for form elements', () => {
      render(<TodoList />);

      expect(
        screen.getByRole('textbox', { name: /add new todo/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add todo/i })
      ).toBeInTheDocument();
    });

    it('has proper ARIA labels for filter buttons', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

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

    it('has proper ARIA labels for bulk action buttons', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      expect(
        screen.getByRole('button', { name: /mark all as complete/i })
      ).toBeInTheDocument();
    });

    it('has proper tabindex attributes', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await user.type(input, 'Test todo{Enter}');

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        if (button.getAttribute('tabIndex') !== null) {
          expect(button).toHaveAttribute('tabIndex', '0');
        }
      });
    });
  });
});
