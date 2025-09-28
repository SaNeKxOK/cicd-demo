import { useState, useMemo } from 'react';
import type { Todo, TodoFilter } from '../types/todo';
import TodoItem from './TodoItem';
import '../styles/TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );
  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: inputText.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTodos((prev) => [...prev, newTodo]);
      setInputText('');
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleEditTodo = (id: string, newText: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  };

  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const handleToggleAll = () => {
    const allCompleted = todos.every((todo) => todo.completed);
    setTodos((prev) =>
      prev.map((todo) => ({ ...todo, completed: !allCompleted }))
    );
  };

  return (
    <div className="todo-container">
      <div className="todo-card">
        <h1 className="todo-title">Todo List</h1>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="todo-form">
          <div className="todo-form-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What needs to be done?"
              className="todo-input"
              aria-label="Add new todo"
            />
            <button
              type="submit"
              className="todo-add-btn"
              aria-label="Add todo"
            >
              Add
            </button>
          </div>
        </form>

        {/* Filter Buttons */}
        {todos.length > 0 && (
          <div className="filter-container">
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              aria-label="Show all todos"
              tabIndex={0}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              aria-label="Show active todos"
              tabIndex={0}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              aria-label="Show completed todos"
              tabIndex={0}
            >
              Completed ({completedCount})
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {todos.length > 0 && (
          <div className="bulk-actions">
            <button
              onClick={handleToggleAll}
              className="bulk-btn toggle-all"
              aria-label={
                todos.every((todo) => todo.completed)
                  ? 'Mark all as incomplete'
                  : 'Mark all as complete'
              }
              tabIndex={0}
            >
              {todos.every((todo) => todo.completed)
                ? 'Uncheck All'
                : 'Check All'}
            </button>
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="bulk-btn clear-completed"
                aria-label="Clear completed todos"
                tabIndex={0}
              >
                Clear Completed ({completedCount})
              </button>
            )}
          </div>
        )}

        {/* Todo List */}
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-text">
              {todos.length === 0 ? (
                <>
                  <svg
                    className="empty-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No todos yet. Add one above!
                </>
              ) : (
                `No ${filter} todos`
              )}
            </div>
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
              />
            ))}
          </ul>
        )}

        {/* Stats */}
        {todos.length > 0 && (
          <div className="todo-stats">
            {activeCount} of {todos.length} tasks remaining
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
