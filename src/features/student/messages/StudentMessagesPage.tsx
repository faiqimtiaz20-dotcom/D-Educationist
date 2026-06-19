import { useState } from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { activityStore } from '@/mocks/data/activities'
import { useStudentPortal } from '@/features/shared/useStudentPortal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function StudentMessagesPage() {
  const { student } = useStudentPortal()
  const studentId = student?.id ?? 's1'
  const [messages, setMessages] = useState(
    () => activityStore.messages.filter((m) => m.studentId === studentId),
  )
  const [text, setText] = useState('')

  const send = () => {
    if (!text.trim()) return
    const msg = {
      id: `m${Date.now()}`,
      studentId,
      sender: 'student' as const,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    activityStore.messages.push(msg)
    setMessages((prev) => [...prev, msg])
    setText('')
    toast.success('Message sent')
  }

  return (
    <PageShell title="Messages" className="pb-20 lg:pb-6">
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardContent className="flex h-[calc(100vh-16rem)] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No messages yet</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    m.sender === 'student'
                      ? 'ml-auto bg-primary text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
                  )}
                >
                  <p>{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {format(new Date(m.createdAt), 'dd MMM HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Textarea
              rows={2}
              placeholder="Type a message to your counsellor..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <Button onClick={send} className="shrink-0 self-end">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
