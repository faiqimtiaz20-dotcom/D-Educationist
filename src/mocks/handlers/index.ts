import { http, HttpResponse } from 'msw'
import coursesData from '@/mocks/data/courses.json'
import { MOCK_USERS } from '@/lib/constants'
import {
  computeDashboardStats,
  createCalendarEvent,
  createRecord,
  createUniversity,
  createUniversityMaster,
  deleteUniversityMasters,
  deleteCalendarEvents,
  deleteRecords,
  deleteUniversities,
  getById,
  getUniversityMasterById,
  listItems,
  listUniversities,
  listUniversityMasters,
  getUniversityByCountry,
  store,
  updateCalendarEvent,
  updateRecord,
  updateUniversity,
  updateUniversityMaster,
  addUniversityCampus,
  type ListParams,
} from '@/mocks/data/store'
import type {
  Application,
  CalendarEvent,
  DeferRecord,
  Enquiry,
  EnrolledRecord,
  Invoice,
  PartnerInvoice,
  Student,
  Timestamps,
  UniversityCommission,
  UniversityMaster,
  VisaRecord,
} from '@/types'

function parseListParams(url: URL): ListParams {
  const isPartnerParam = url.searchParams.get('isPartner')
  return {
    page: Number(url.searchParams.get('page') ?? 1),
    pageSize: Number(url.searchParams.get('pageSize') ?? 10),
    search: url.searchParams.get('search') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    partnerId: url.searchParams.get('partnerId') ?? undefined,
    isPartner:
      isPartnerParam === null || isPartnerParam === ''
        ? undefined
        : isPartnerParam === 'true',
  }
}

async function readJsonBody<T>(request: Request): Promise<T> {
  const text = await request.text()
  if (!text.trim()) return {} as T
  return JSON.parse(text) as T
}

function notFound(message = 'Not found') {
  return HttpResponse.json({ message }, { status: 404 })
}

function createTimedHandlers<
  T extends { id: string } & Timestamps,
  CreateDto extends Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
>(
  basePath: string,
  getCollection: () => T[],
  idPrefix: string,
  searchFields: (keyof T)[],
  options?: {
    statusField?: keyof T
    partnerIdField?: keyof T
    isPartnerField?: keyof T
  },
) {
  const filterOptions = {
    searchFields,
    statusField: options?.statusField,
    partnerIdField: options?.partnerIdField ?? ('partnerId' as keyof T),
    isPartnerField: options?.isPartnerField,
  }

  return [
    http.get(basePath, ({ request }) => {
      const params = parseListParams(new URL(request.url))
      return HttpResponse.json(listItems(getCollection(), params, filterOptions))
    }),

    http.get(`${basePath}/:id`, ({ params }) => {
      const item = getById(getCollection(), String(params.id))
      if (!item) return notFound()
      return HttpResponse.json(item)
    }),

    http.post(basePath, async ({ request }) => {
      const body = await readJsonBody<CreateDto>(request)
      const created = createRecord(getCollection(), body, idPrefix)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.patch(`${basePath}/:id`, async ({ params, request }) => {
      const body = await readJsonBody<Partial<T>>(request)
      const updated = updateRecord(getCollection(), String(params.id), body)
      if (!updated) return notFound()
      return HttpResponse.json(updated)
    }),

    http.delete(`${basePath}/:id`, ({ params }) => {
      const deleted = deleteRecords(getCollection(), [String(params.id)])
      if (!deleted) return notFound()
      return HttpResponse.json({ deleted })
    }),

    http.delete(basePath, async ({ request }) => {
      const body = await readJsonBody<{ ids?: string[] }>(request)
      const ids = body.ids ?? []
      const deleted = deleteRecords(getCollection(), ids)
      return HttpResponse.json({ deleted })
    }),
  ]
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await readJsonBody<{
      username: string
      password: string
      portal: string
    }>(request)

    const mock = MOCK_USERS[body.portal]
    if (!mock || body.password !== mock.password) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({
      user: {
        ...mock.user,
        name: body.username || mock.user.name,
      },
    })
  }),

  ...createTimedHandlers<Enquiry, Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/enquiries',
    () => store.enquiries,
    'e',
    ['firstName', 'lastName', 'email', 'mobile', 'interestedCourse', 'interestedCountry'],
    { statusField: 'status' },
  ),

  ...createTimedHandlers<Student, Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/students',
    () => store.students,
    's',
    ['firstName', 'lastName', 'email', 'mobile', 'studentId'],
    { statusField: 'status' },
  ),

  ...createTimedHandlers<Application, Omit<Application, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/applications',
    () => store.applications,
    'a',
    ['studentName', 'email', 'mobile', 'studentRef', 'university'],
    { statusField: 'status', isPartnerField: 'isPartner' },
  ),

  ...createTimedHandlers<VisaRecord, Omit<VisaRecord, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/visas',
    () => store.visas,
    'v',
    ['studentName', 'email', 'mobile', 'appliedCountry', 'university'],
    { statusField: 'visaStatus', isPartnerField: 'isPartner' },
  ),

  ...createTimedHandlers<DeferRecord, Omit<DeferRecord, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/defers',
    () => store.defers,
    'd',
    ['studentName', 'email', 'mobile', 'studentRef', 'deferReason'],
    { isPartnerField: 'isPartner' },
  ),

  ...createTimedHandlers<EnrolledRecord, Omit<EnrolledRecord, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/enrolled',
    () => store.enrolled,
    'en',
    ['studentName', 'email', 'mobile', 'studentRef', 'appliedUniversity'],
    { statusField: 'status', isPartnerField: 'isPartner' },
  ),

  ...createTimedHandlers<Invoice, Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>(
    '/api/invoices',
    () => store.invoices,
    'inv',
    ['name', 'email', 'mobile', 'invoiceId', 'serviceType'],
    { statusField: 'status' },
  ),

  ...createTimedHandlers<
    PartnerInvoice,
    Omit<PartnerInvoice, 'id' | 'createdAt' | 'updatedAt'>
  >(
    '/api/partner-invoices',
    () => store.partnerInvoices,
    'pi',
    ['invoiceNo', 'createdBy'],
    { statusField: 'status' },
  ),

  ...createTimedHandlers<
    UniversityCommission,
    Omit<UniversityCommission, 'id' | 'createdAt' | 'updatedAt'>
  >(
    '/api/university-commission',
    () => store.universityCommission,
    'uc',
    ['invoiceNo', 'country', 'university', 'createdBy'],
    { statusField: 'status' },
  ),

  http.get('/api/calendar-events', ({ request }) => {
    const params = parseListParams(new URL(request.url))
    return HttpResponse.json(
      listItems(store.calendarEvents, params, {
        searchFields: ['title', 'category', 'eventType', 'branch'],
      }),
    )
  }),

  http.get('/api/calendar-events/:id', ({ params }) => {
    const item = getById(store.calendarEvents, String(params.id))
    if (!item) return notFound()
    return HttpResponse.json(item)
  }),

  http.post('/api/calendar-events', async ({ request }) => {
    const body = await readJsonBody<Omit<CalendarEvent, 'id'>>(request)
    const created = createCalendarEvent(body)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch('/api/calendar-events/:id', async ({ params, request }) => {
    const body = await readJsonBody<Partial<CalendarEvent>>(request)
    const updated = updateCalendarEvent(String(params.id), body)
    if (!updated) return notFound()
    return HttpResponse.json(updated)
  }),

  http.delete('/api/calendar-events/:id', ({ params }) => {
    const deleted = deleteCalendarEvents([String(params.id)])
    if (!deleted) return notFound()
    return HttpResponse.json({ deleted })
  }),

  http.delete('/api/calendar-events', async ({ request }) => {
    const body = await readJsonBody<{ ids?: string[] }>(request)
    const deleted = deleteCalendarEvents(body.ids ?? [])
    return HttpResponse.json({ deleted })
  }),

  http.get('/api/dashboard/stats', ({ request }) => {
    const url = new URL(request.url)
    const partnerId = url.searchParams.get('partnerId') ?? undefined
    const branch = url.searchParams.get('branch') ?? undefined
    return HttpResponse.json(computeDashboardStats({ partnerId, branch }))
  }),

  http.get('/api/universities', ({ request }) => {
    const params = parseListParams(new URL(request.url))
    return HttpResponse.json(listUniversities(params))
  }),

  http.get('/api/universities/:id', ({ params }) => {
    const country = decodeURIComponent(String(params.id))
    const item = getUniversityByCountry(country)
    if (!item) return notFound()
    return HttpResponse.json(item)
  }),

  http.post('/api/universities', async ({ request }) => {
    const body = await readJsonBody<{ country: string; count: number }>(request)
    const created = createUniversity(body)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch('/api/universities/:id', async ({ params, request }) => {
    const country = decodeURIComponent(String(params.id))
    const body = await readJsonBody<{ country?: string; count?: number }>(request)
    const updated = updateUniversity(country, body)
    if (!updated) return notFound()
    return HttpResponse.json(updated)
  }),

  http.delete('/api/universities/:id', ({ params }) => {
    const country = decodeURIComponent(String(params.id))
    const deleted = deleteUniversities([country])
    if (!deleted) return notFound()
    return HttpResponse.json({ deleted })
  }),

  http.delete('/api/universities', async ({ request }) => {
    const body = await readJsonBody<{ ids?: string[] }>(request)
    const countries = (body.ids ?? []).map((id) => decodeURIComponent(id))
    const deleted = deleteUniversities(countries)
    return HttpResponse.json({ deleted })
  }),

  http.get('/api/university-masters', ({ request }) => {
    const url = new URL(request.url)
    const params = {
      ...parseListParams(url),
      country: url.searchParams.get('country') ?? undefined,
    }
    return HttpResponse.json(listUniversityMasters(params))
  }),

  http.get('/api/university-masters/:id', ({ params }) => {
    const item = getUniversityMasterById(String(params.id))
    if (!item) return notFound()
    return HttpResponse.json(item)
  }),

  http.post('/api/university-masters', async ({ request }) => {
    const body = await readJsonBody<Omit<UniversityMaster, 'id' | 'createdAt' | 'updatedAt'>>(request)
    const created = createUniversityMaster(body)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch('/api/university-masters/:id', async ({ params, request }) => {
    const body = await readJsonBody<Partial<UniversityMaster>>(request)
    const updated = updateUniversityMaster(String(params.id), body)
    if (!updated) return notFound()
    return HttpResponse.json(updated)
  }),

  http.delete('/api/university-masters/:id', ({ params }) => {
    const deleted = deleteUniversityMasters([String(params.id)])
    if (!deleted) return notFound()
    return HttpResponse.json({ deleted })
  }),

  http.delete('/api/university-masters', async ({ request }) => {
    const body = await readJsonBody<{ ids?: string[] }>(request)
    const ids = body.ids ?? []
    const deleted = deleteUniversityMasters(ids)
    return HttpResponse.json({ deleted })
  }),

  http.post('/api/university-masters/:id/campuses', async ({ params, request }) => {
    const body = await readJsonBody<{ name: string; city?: string }>(request)
    const updated = addUniversityCampus(String(params.id), body)
    if (!updated) return notFound()
    return HttpResponse.json(updated)
  }),

  http.get('/api/courses', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 50)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const country = url.searchParams.get('country') ?? ''
    const level = url.searchParams.get('level') ?? ''
    const course = (url.searchParams.get('course') ?? '').toLowerCase()
    const intake = url.searchParams.get('intake') ?? ''

    let items = coursesData as Array<{
      id: string
      country: string
      university: string
      course: string
      level: string
      intake: string
      duration: string
      tuition: string
    }>

    if (country) items = items.filter((c) => c.country === country)
    if (level) items = items.filter((c) => c.level === level)
    if (intake) items = items.filter((c) => c.intake === intake)
    if (course) items = items.filter((c) => c.course.toLowerCase().includes(course))
    if (search) {
      items = items.filter(
        (c) =>
          c.course.toLowerCase().includes(search) ||
          c.university.toLowerCase().includes(search) ||
          c.country.toLowerCase().includes(search),
      )
    }

    const total = items.length
    const start = (page - 1) * pageSize
    const data = items.slice(start, start + pageSize)

    return HttpResponse.json({ data, total, page, pageSize })
  }),
]
