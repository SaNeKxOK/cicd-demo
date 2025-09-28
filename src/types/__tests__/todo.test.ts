import { describe, it, expect } from 'vitest';
import type { Todo, TodoFilter } from '../todo';

describe('Todo Types', () => {
  describe('Todo interface', () => {
    it('should accept valid todo object', () => {
      const validTodo: Todo = {
        id: '123',
        text: 'Test todo',
        completed: false,
        createdAt: new Date('2023-01-01'),
      };

      expect(validTodo.id).toBe('123');
      expect(validTodo.text).toBe('Test todo');
      expect(validTodo.completed).toBe(false);
      expect(validTodo.createdAt).toBeInstanceOf(Date);
    });

    it('should accept completed todo', () => {
      const completedTodo: Todo = {
        id: '456',
        text: 'Completed todo',
        completed: true,
        createdAt: new Date('2023-01-01'),
      };

      expect(completedTodo.completed).toBe(true);
    });

    it('should have required properties', () => {
      const todo: Todo = {
        id: '789',
        text: 'Required properties test',
        completed: false,
        createdAt: new Date(),
      };

      // TypeScript will ensure these properties exist at compile time
      expect(typeof todo.id).toBe('string');
      expect(typeof todo.text).toBe('string');
      expect(typeof todo.completed).toBe('boolean');
      expect(todo.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('TodoFilter type', () => {
    it('should accept valid filter values', () => {
      const filters: TodoFilter[] = ['all', 'active', 'completed'];

      expect(filters).toContain('all');
      expect(filters).toContain('active');
      expect(filters).toContain('completed');
    });

    it('should work with type checking', () => {
      let filter: TodoFilter = 'all';
      expect(filter).toBe('all');

      filter = 'active';
      expect(filter).toBe('active');

      filter = 'completed';
      expect(filter).toBe('completed');
    });
  });

  describe('Todo object validation', () => {
    it('should work with real todo creation pattern', () => {
      const createTodo = (text: string): Todo => ({
        id: crypto.randomUUID(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
      });

      const todo = createTodo('  Test todo  ');

      expect(todo.text).toBe('Test todo');
      expect(todo.completed).toBe(false);
      expect(typeof todo.id).toBe('string');
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should work with todo update patterns', () => {
      const originalTodo: Todo = {
        id: '1',
        text: 'Original text',
        completed: false,
        createdAt: new Date('2023-01-01'),
      };

      // Toggle completion
      const toggledTodo: Todo = {
        ...originalTodo,
        completed: !originalTodo.completed,
      };

      expect(toggledTodo.completed).toBe(true);
      expect(toggledTodo.id).toBe(originalTodo.id);
      expect(toggledTodo.text).toBe(originalTodo.text);

      // Update text
      const editedTodo: Todo = {
        ...originalTodo,
        text: 'Updated text',
      };

      expect(editedTodo.text).toBe('Updated text');
      expect(editedTodo.completed).toBe(originalTodo.completed);
    });
  });

  describe('Filter functionality patterns', () => {
    it('should work with filter functions', () => {
      const todos: Todo[] = [
        {
          id: '1',
          text: 'Active todo',
          completed: false,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          text: 'Completed todo',
          completed: true,
          createdAt: new Date('2023-01-02'),
        },
      ];

      const filterTodos = (todos: Todo[], filter: TodoFilter): Todo[] => {
        switch (filter) {
          case 'active':
            return todos.filter((todo) => !todo.completed);
          case 'completed':
            return todos.filter((todo) => todo.completed);
          default:
            return todos;
        }
      };

      expect(filterTodos(todos, 'all')).toHaveLength(2);
      expect(filterTodos(todos, 'active')).toHaveLength(1);
      expect(filterTodos(todos, 'completed')).toHaveLength(1);

      expect(filterTodos(todos, 'active')[0].text).toBe('Active todo');
      expect(filterTodos(todos, 'completed')[0].text).toBe('Completed todo');
    });

    it('should work with count calculations', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Todo 1', completed: false, createdAt: new Date() },
        { id: '2', text: 'Todo 2', completed: true, createdAt: new Date() },
        { id: '3', text: 'Todo 3', completed: false, createdAt: new Date() },
        { id: '4', text: 'Todo 4', completed: true, createdAt: new Date() },
      ];

      const completedCount = todos.filter((todo) => todo.completed).length;
      const activeCount = todos.filter((todo) => !todo.completed).length;

      expect(completedCount).toBe(2);
      expect(activeCount).toBe(2);
      expect(completedCount + activeCount).toBe(todos.length);
    });
  });
});
