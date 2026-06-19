import { BookOpen, ExternalLink, PlayCircle } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const RESOURCES = [
  {
    id: '1',
    title: 'IELTS Preparation Guide',
    description: 'Complete guide to scoring band 7+ in IELTS Academic.',
    type: 'PDF',
    category: 'Test Prep',
  },
  {
    id: '2',
    title: 'Statement of Purpose Writing',
    description: 'Tips and templates for writing a compelling SOP.',
    type: 'Guide',
    category: 'Applications',
  },
  {
    id: '3',
    title: 'Visa Interview Preparation',
    description: 'Common questions and best practices for visa interviews.',
    type: 'Video',
    category: 'Visa',
  },
  {
    id: '4',
    title: 'Country Comparison: Australia vs Canada',
    description: 'Compare study options, costs, and post-study work rights.',
    type: 'Article',
    category: 'Research',
  },
  {
    id: '5',
    title: 'Financial Planning for Study Abroad',
    description: 'Budget templates and scholarship application tips.',
    type: 'PDF',
    category: 'Finance',
  },
  {
    id: '6',
    title: 'PTE Academic Crash Course',
    description: 'Video series covering all PTE sections with practice tests.',
    type: 'Video',
    category: 'Test Prep',
  },
]

export default function StudentResourcesPage() {
  return (
    <PageShell title="Learning Resources" className="pb-20 lg:pb-6">
      <p className="text-sm text-gray-500">
        Curated resources to help you prepare for your study abroad journey.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {RESOURCES.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  {resource.type === 'Video' ? (
                    <PlayCircle className="size-5 text-primary" />
                  ) : (
                    <BookOpen className="size-5 text-primary" />
                  )}
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {resource.category}
                </span>
              </div>
              <CardTitle className="text-base">{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="flex-1 text-sm text-gray-500">{resource.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{resource.type}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Opening ${resource.title}`)}
                >
                  <ExternalLink className="size-3.5" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
