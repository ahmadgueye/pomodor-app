import { useState } from 'react'
import { createTodo } from '../lib/todos'

export default function TodoList({ todos, onChange }) {
  const [draft, setDraft] = useState('')

  const addTodo = (event) => {
    event.preventDefault()
    const next = createTodo(draft)
    if (!next) return
    onChange([...todos, next])
    setDraft('')
  }

  const toggleTodo = (id) => {
    onChange(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  const removeTodo = (id) => {
    onChange(todos.filter((todo) => todo.id !== id))
  }

  return (
    <section className="todos" id="todos-panel" aria-labelledby="todos-heading">
      {/* <h2 id="todos-heading" className="settings-title">
        Tâches
      </h2> */}

      <div className="todos-panel">
        <form className="todos-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="todo-input">
            Nouvelle tâche
          </label>
          <input
            id="todo-input"
            className="todos-input"
            type="text"
            value={draft}
            maxLength={120}
            placeholder="Ajouter une tâche…"
            autoComplete="off"
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            className="todos-add"
            disabled={!draft.trim()}
            aria-label="Ajouter"
          >
            Ajouter
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="todos-empty">Rien pour l’instant. Une idée suffit.</p>
        ) : (
          <ul className="todos-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`todos-item${todo.done ? ' is-done' : ''}`}
              >
                <label className="todos-check">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="todos-text">{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="todos-remove"
                  aria-label={`Supprimer « ${todo.text} »`}
                  onClick={() => removeTodo(todo.id)}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 6l12 12M18 6 6 18"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
