import { useState } from 'react';
import '../styles/TodoInput.css';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
}

const TodoInput = ({ onAddTodo }: TodoInputProps) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddTodo(inputText.trim());
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="todo-form-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
          aria-label="Add new todo"
        />
        <button type="submit" className="todo-add-btn" aria-label="Add todo">
          Add
        </button>
      </div>
    </form>
  );
};

export default TodoInput;
