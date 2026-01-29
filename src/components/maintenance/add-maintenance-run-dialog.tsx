'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMaintenanceRun } from '@/lib/actions/maintenance'
import { toast } from 'sonner'
import type { MaintenanceCommandType } from '@/types/database'

type Props = {
  applicationId: string
  commandTypes: MaintenanceCommandType[]
  children?: React.ReactNode
}

export function AddMaintenanceRunDialog({
  applicationId,
  commandTypes,
  children,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commandTypeId, setCommandTypeId] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createMaintenanceRun(formData)

    if (result.success) {
      toast.success('Maintenance run logged successfully')
      setOpen(false)
      setCommandTypeId('')
      setNotes('')
    } else {
      toast.error(result.error || 'Failed to log maintenance run')
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Log Maintenance</Button>}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Maintenance Run</DialogTitle>
            <DialogDescription>
              Record that you ran a maintenance command on this application.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <input type="hidden" name="application_id" value={applicationId} />

            <div className="grid gap-2">
              <Label htmlFor="command_type_id">Command Type</Label>
              <Select
                name="command_type_id"
                value={commandTypeId}
                onValueChange={setCommandTypeId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select command type" />
                </SelectTrigger>
                <SelectContent>
                  {commandTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Notes about this maintenance run..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                Add any notes or observations from this maintenance run
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !commandTypeId}>
              {loading ? 'Logging...' : 'Log Run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
