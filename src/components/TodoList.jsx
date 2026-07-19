import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createTodo } from '../lib/todos'

const dropAnimation = {
  duration: 220,
  easing: 'ease',
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.35',
      },
    },
  }),
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function DragHandle({ attributes, listeners, label }) {
  return (
    <button
      type="button"
      className="todos-drag"
      aria-label={label}
      {...attributes}
      {...listeners}
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <circle cx="5" cy="3.5" r="1.25" />
        <circle cx="11" cy="3.5" r="1.25" />
        <circle cx="5" cy="8" r="1.25" />
        <circle cx="11" cy="8" r="1.25" />
        <circle cx="5" cy="12.5" r="1.25" />
        <circle cx="11" cy="12.5" r="1.25" />
      </svg>
    </button>
  )
}

function TodoRow({
  todo,
  isActive,
  onToggle,
  onRemove,
  onSetFocus,
  dragHandleProps,
  isOverlay = false,
}) {
  return (
    <>
      <DragHandle
        attributes={dragHandleProps?.attributes}
        listeners={dragHandleProps?.listeners}
        label={`Déplacer « ${todo.text} »`}
      />
      <span
        className={`todos-focus-dot${isActive ? ' is-active' : ''}${todo.done ? ' is-done' : ''}`}
        aria-hidden="true"
      >
        <span className="todos-focus-dot-core" />
      </span>
      {todo.done ? (
        <span className="todos-text">{todo.text}</span>
      ) : (
        <button
          type="button"
          className="todos-select"
          aria-pressed={isActive}
          tabIndex={isOverlay ? -1 : undefined}
          onClick={() => onSetFocus?.(todo.id)}
        >
          <span className="todos-text">{todo.text}</span>
        </button>
      )}
      <label className="todos-check">
        <span className="sr-only">
          {todo.done ? 'Marquer comme à faire' : 'Marquer comme faite'}
        </span>
        <input
          type="checkbox"
          checked={todo.done}
          tabIndex={isOverlay ? -1 : undefined}
          onChange={() => onToggle?.(todo.id)}
        />
      </label>
      <button
        type="button"
        className="todos-remove"
        aria-label={`Supprimer « ${todo.text} »`}
        tabIndex={isOverlay ? -1 : undefined}
        onClick={() => onRemove?.(todo.id)}
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
    </>
  )
}

function SortableTodoItem({ todo, isFocus, onToggle, onRemove, onSetFocus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        'todos-item',
        todo.done ? 'is-done' : '',
        isFocus ? 'is-active' : '',
        !todo.done ? 'is-selectable' : '',
        isDragging ? 'is-dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <TodoRow
        todo={todo}
        isActive={isFocus}
        onToggle={onToggle}
        onRemove={onRemove}
        onSetFocus={onSetFocus}
        dragHandleProps={{ attributes, listeners }}
      />
    </li>
  )
}

export default function TodoList({ todos, activeId, onChange, onSetActive }) {
  const [draft, setDraft] = useState('')
  const [activeDragId, setActiveDragId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const addTodo = (event) => {
    event.preventDefault()
    const next = createTodo(draft)
    if (!next) return
    const shouldActivate = !activeId
    onChange([...todos, next])
    if (shouldActivate) onSetActive(next.id)
    setDraft('')
  }

  const toggleTodo = (id) => {
    const next = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    )
    onChange(next)
    const toggled = next.find((todo) => todo.id === id)
    if (toggled?.done && activeId === id) {
      onSetActive(null)
    }
  }

  const removeTodo = (id) => {
    onChange(todos.filter((todo) => todo.id !== id))
    if (activeId === id) onSetActive(null)
  }

  const setFocus = (id) => {
    if (activeId === id) {
      onSetActive(null)
      return
    }
    onSetActive(id)
  }

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveDragId(null)
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((todo) => todo.id === active.id)
    const newIndex = todos.findIndex((todo) => todo.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(todos, oldIndex, newIndex))
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const activeDragTodo = activeDragId
    ? todos.find((todo) => todo.id === activeDragId)
    : null

  return (
    <section className="todos" id="todos-panel" aria-labelledby="todos-heading">
      <div className="todos-panel">
        <form className="todos-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="todo-input">
            Nouvelle intention
          </label>
          <input
            id="todo-input"
            className="todos-input"
            type="text"
            value={draft}
            maxLength={120}
            placeholder="Ajouter une intention…"
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={todos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="todos-list">
                {todos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    isFocus={activeId === todo.id && !todo.done}
                    onToggle={toggleTodo}
                    onRemove={removeTodo}
                    onSetFocus={setFocus}
                  />
                ))}
              </ul>
            </SortableContext>

            {createPortal(
              <DragOverlay
                dropAnimation={prefersReducedMotion() ? null : dropAnimation}
              >
                {activeDragTodo ? (
                  <div
                    className={[
                      'todos-item',
                      'todos-item-overlay',
                      activeDragTodo.done ? 'is-done' : '',
                      activeId === activeDragTodo.id && !activeDragTodo.done
                        ? 'is-active'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <TodoRow
                      todo={activeDragTodo}
                      isActive={
                        activeId === activeDragTodo.id && !activeDragTodo.done
                      }
                      isOverlay
                    />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        )}
      </div>
    </section>
  )
}
