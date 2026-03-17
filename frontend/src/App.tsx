import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import './App.css'
import { completeTask, createTask, deleteTask, getCategories, getTasks, suggestSubtasks } from './api/tasksService'
import type { Category, SubtaskSuggestionResponse, Task } from './types/task'

const statusLabels: Record<Task['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSuggestingSubtasks, setIsSuggestingSubtasks] = useState(false)
  const [subtaskSuggestions, setSubtaskSuggestions] = useState<string[]>([])
  const [suggestionTitle, setSuggestionTitle] = useState('')

  const loadTasks = async () => {
    setIsLoadingTasks(true)

    try {
      const data = await getTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setFeedback('Could not load tasks. Please check the API and try again.')
      setTasks([])
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const loadCategories = async () => {
    setIsLoadingCategories(true)

    try {
      const data = await getCategories()
      const nextCategories = Array.isArray(data) ? data : []
      setCategories(nextCategories)
      setCategory((currentCategory) => {
        if (currentCategory && nextCategories.some((item) => item.name === currentCategory)) {
          return currentCategory
        }

        return nextCategories[0]?.name ?? ''
      })
    } catch {
      setFeedback('Could not load categories. Please check the API and try again.')
      setCategories([])
      setCategory('')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
    void loadTasks()
    void loadCategories()
  }, [])

  const handleComplete = async (id: number) => {
    try {
      await completeTask(id)
      await loadTasks()
    } catch {
      setFeedback('Could not complete the task. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id)
      await loadTasks()
    } catch {
      setFeedback('Could not delete the task. Please try again.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback('')

    try {
      await createTask({
        title,
        description,
        category,
      })

      setFeedback('Task created successfully.')
      setTitle('')
      setDescription('')
      setCategory('')
      await loadTasks()
    } catch {
      setFeedback('Could not create task. Please check the API and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestSubtasks = async () => {
    if (!title.trim()) {
      setFeedback('Write a task title before requesting AI subtasks.')
      setSubtaskSuggestions([])
      return
    }

    setIsSuggestingSubtasks(true)
    setFeedback('')

    try {
      const data: SubtaskSuggestionResponse = await suggestSubtasks(title.trim())
      setSuggestionTitle(data.title)
      setSubtaskSuggestions(Array.isArray(data.subtasks) ? data.subtasks.slice(0, 5) : [])
    } catch (error) {
      setSubtaskSuggestions([])
      if (axios.isAxiosError(error) && typeof error.response?.data?.detail === 'string') {
        setFeedback(error.response.data.detail)
      } else {
        setFeedback('Could not generate subtasks right now. Please try again.')
      }
    } finally {
      setIsSuggestingSubtasks(false)
    }
  }

  return (
    <main className="task-page">
      <section className="task-card">
        <h1>Create Task</h1>
        <p>Fill in task details and post it to the API.</p>

        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Buy groceries"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add details for this task"
            rows={4}
            required
          />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            disabled={isLoadingCategories || categories.length === 0}
          >
            {isLoadingCategories ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))
            )}
          </select>

          <button type="submit" disabled={isSubmitting || isLoadingCategories || categories.length === 0}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={isSuggestingSubtasks || !title.trim()}
            onClick={() => void handleSuggestSubtasks()}
          >
            {isSuggestingSubtasks ? 'Thinking...' : 'Suggest subtasks'}
          </button>
        </form>

        {feedback && <p className="feedback">{feedback}</p>}

        {subtaskSuggestions.length > 0 && (
          <section className="suggestions-panel" aria-live="polite">
            <h2>Suggested Subtasks</h2>
            <p>AI suggestions for: {suggestionTitle || title}</p>
            <ol className="suggestions-list">
              {subtaskSuggestions.map((subtask) => (
                <li key={subtask}>{subtask}</li>
              ))}
            </ol>
          </section>
        )}

        <section className="tasks-section" aria-live="polite">
          <h2>Current Tasks</h2>

          {isLoadingTasks ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks created yet.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-item-header">
                    <h3>{task.title}</h3>
                    <span className={`task-status task-status-${task.status}`}>
                      {statusLabels[task.status] ?? task.status}
                    </span>
                  </div>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    <small>Category: {task.category || 'Uncategorized'}</small>
                    <small>
                      Updated:{' '}
                      {new Date(task.updated_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </small>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={task.status === 'completed'}
                      onClick={() => void handleComplete(task.id)}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => void handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
