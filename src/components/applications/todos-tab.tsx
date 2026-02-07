'use client'

import { useState, useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckSquare, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  reorderTodos,
} from '@/lib/actions/todos'
import type { AppTodo } from '@/types/database'

interface TodosTabProps {
  applicationId: string
  initialTodos: AppTodo[]
}

export function TodosTab({ applicationId, initialTodos }: TodosTabProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [newText, setNewText] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    const text = newText.trim()
    if (!text) return

    setNewText('')
    startTransition(async () => {
      const result = await createTodo(applicationId, text)
      if (result.success && result.data) {
        setTodos((prev) => [...prev, result.data!])
      }
    })
  }

  function handleToggle(id: string, completed: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    )
    startTransition(async () => {
      await toggleTodo(id, completed, applicationId)
    })
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    startTransition(async () => {
      await deleteTodo(id, applicationId)
    })
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= todos.length) return

    const reordered = [...todos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    setTodos(reordered)

    startTransition(async () => {
      await reorderTodos(
        applicationId,
        reordered.map((t) => t.id)
      )
    })
  }

  const visibleTodos = showCompleted
    ? todos
    : todos.filter((t) => !t.completed)
  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="space-y-4">
      {/* Add todo form */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a todo..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          disabled={isPending}
        />
        <Button onClick={handleAdd} disabled={isPending || !newText.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Toggle completed visibility */}
      {completedCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCompleted((prev) => !prev)}
          className="text-muted-foreground"
        >
          {showCompleted ? (
            <EyeOff className="mr-2 h-4 w-4" />
          ) : (
            <Eye className="mr-2 h-4 w-4" />
          )}
          {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
        </Button>
      )}

      {/* Todo list */}
      {todos.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No todos yet"
          description="Add tasks to track for this application."
        />
      ) : visibleTodos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          All todos completed! Toggle visibility to see them.
        </p>
      ) : (
        <div className="space-y-1">
          {visibleTodos.map((todo, index) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) =>
                  handleToggle(todo.id, checked === true)
                }
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed
                    ? 'line-through text-muted-foreground'
                    : ''
                }`}
              >
                {todo.text}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === visibleTodos.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDelete(todo.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
