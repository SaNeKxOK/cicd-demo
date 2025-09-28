import { useState } from 'react';
import type { Todo } from '../types/todo';
import '../styles/TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete, onEdit }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <li className="todo-item editing">
        <form onSubmit={handleSubmit} className="edit-form">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="edit-input"
            autoFocus
            aria-label="Edit todo text"
          />

          <button
            type="submit"
            className="edit-btn save"
            aria-label="Save changes"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="edit-btn cancel"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="todo-item">
      <button
        onClick={() => onToggle(todo.id)}
        className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        tabIndex={0}
      >
        {todo.completed && (
          <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
        {todo.text}
      </span>

      <div className="todo-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="action-btn edit"
          aria-label="Edit todo"
          tabIndex={0}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="action-btn delete"
          aria-label="Delete todo"
          tabIndex={0}
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
