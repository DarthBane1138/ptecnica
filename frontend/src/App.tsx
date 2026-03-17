import { useEffect, useState } from 'react'
import './App.css'
import { createTask, getTasks } from './api/tasksService'
import type { Task } from './types/task'

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

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

  useEffect(() => {
    void loadTasks()
  }, [])

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
          <input
            id="category"
            name="category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Example: Personal"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </form>

        {feedback && <p className="feedback">{feedback}</p>}

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
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <small>Category: {task.category}</small>
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
