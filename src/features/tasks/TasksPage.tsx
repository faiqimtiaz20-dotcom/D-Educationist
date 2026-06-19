import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, CheckCircle } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/data-display/DataTable'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { TaskItem } from '@/types'
import { format } from 'date-fns'

const TASKS: TaskItem[] = [
  { id: 't1', title: 'Follow up with Hassan Ali', description: 'Visa documents pending', dueDate: '2026-06-20', assignedTo: 'Counsellor A', status: 'pending', priority: 'high', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 't2', title: 'Review Bilal application', dueDate: '2026-06-22', assignedTo: 'Counselling', status: 'pending', priority: 'medium', createdAt: '2026-06-16T00:00:00Z', updatedAt: '2026-06-16T00:00:00Z' },
  { id: 't3', title: 'Send invoice reminder', dueDate: '2026-06-18', assignedTo: 'Accounts', status: 'completed', priority: 'low', createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-17T00:00:00Z' },
]

async function fetchTasks(): Promise<TaskItem[]> {
  await new Promise((r) => setTimeout(r, 300))
  return TASKS
}

export function TasksPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('Counsellor A')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskItem['priority']>('medium')

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300))
      const task = TASKS.find((t) => t.id === id)
      if (task) task.status = 'completed'
    },
    onSuccess: () => {
      toast.success('Task completed')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      await new Promise((r) => setTimeout(r, 300))
      const task: TaskItem = {
        ...payload,
        id: `t${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      TASKS.unshift(task)
      return task
    },
    onSuccess: () => {
      toast.success('Task created')
      setCreateOpen(false)
      setTitle('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const columns: ColumnDef<TaskItem>[] = [
    { accessorKey: 'title', header: 'Task' },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description ?? '—' },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(new Date(row.original.dueDate), 'dd MMM yyyy'),
    },
    { accessorKey: 'assignedTo', header: 'Assigned To' },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.priority}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} compact />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) =>
        row.original.status === 'pending' ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => completeMutation.mutate(row.original.id)}
          >
            <CheckCircle className="size-3" />
            Complete
          </Button>
        ) : null,
    },
  ]

  return (
    <PageShell
      title="Tasks"
      breadcrumbs={[{ label: 'Tasks' }]}
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add Task
        </Button>
      }
    >
      <DataTable data={tasks} columns={columns} searchPlaceholder="Search tasks..." />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned To</Label>
              <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskItem['priority'])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  title,
                  assignedTo,
                  dueDate,
                  priority,
                  status: 'pending',
                })
              }
              disabled={!title || !dueDate || createMutation.isPending}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
