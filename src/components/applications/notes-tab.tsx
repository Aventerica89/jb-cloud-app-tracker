'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { RelativeTime } from '@/components/ui/relative-time'
import { createNote, updateNote, deleteNote } from '@/lib/actions/notes'
import type { AppNote } from '@/types/database'

interface NotesTabProps {
  applicationId: string
  initialNotes: AppNote[]
}

export function NotesTab({ applicationId, initialNotes }: NotesTabProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    const content = newContent.trim()
    if (!content) return

    startTransition(async () => {
      const result = await createNote(applicationId, content)
      if (result.success && result.data) {
        setNotes((prev) => [result.data!, ...prev])
        setNewContent('')
        setIsAdding(false)
      }
    })
  }

  function startEdit(note: AppNote) {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  function handleUpdate(id: string) {
    const content = editContent.trim()
    if (!content) return

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n))
    )
    setEditingId(null)

    startTransition(async () => {
      await updateNote(id, content, applicationId)
    })
  }

  function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    startTransition(async () => {
      await deleteNote(id, applicationId)
    })
  }

  return (
    <div className="space-y-4">
      {/* Add note button/form */}
      {isAdding ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={isPending || !newContent.trim()}
              size="sm"
            >
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewContent('')
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      )}

      {/* Notes list */}
      {notes.length === 0 && !isAdding ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Add notes and documentation for this application."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg border bg-card"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdate(note.id)}
                      disabled={isPending || !editContent.trim()}
                      size="sm"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <RelativeTime
                      date={note.updated_at || note.created_at}
                      className="text-xs text-muted-foreground"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEdit(note)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
