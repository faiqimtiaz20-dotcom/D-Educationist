# KRS CRM API Contract

TypeScript types in `src/types/index.ts` define the data model. Services in `src/services/` map to these REST endpoints.

Base URL: `/api` (proxied in dev via MSW)

## Authentication

### POST `/api/auth/login`
```json
{ "username": "string", "password": "string", "portal": "admin" | "partner" | "student" }
```
Response: `{ "user": User }`

## Common List Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (1-based) |
| `pageSize` | number | Items per page |
| `search` | string | Name, email, mobile, ID search |
| `status` | string | Status filter |
| `partnerId` | string | Filter by partner |
| `isPartner` | boolean | KRS vs partner records |
| `branch` | string | Branch filter |

Response: `PaginatedResponse<T>` — `{ data: T[], total, page, pageSize }`

## Enquiries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enquiries` | List enquiries |
| GET | `/api/enquiries/:id` | Get enquiry |
| POST | `/api/enquiries` | Create enquiry |
| PATCH | `/api/enquiries/:id` | Update enquiry |
| DELETE | `/api/enquiries` | Delete by ids `{ ids: string[] }` |

## Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students |
| GET | `/api/students/:id` | Get student with academics, tests, work exp |
| POST | `/api/students` | Create student |
| PATCH | `/api/students/:id` | Update student |
| DELETE | `/api/students` | Delete by ids |

## Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List applications |
| GET | `/api/applications/:id` | Get application |
| POST | `/api/applications` | Create application |
| PATCH | `/api/applications/:id` | Update status |
| DELETE | `/api/applications` | Delete by ids |

## Visas

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visas` | List visa records |
| PATCH | `/api/visas/:id` | Update visa status |
| DELETE | `/api/visas` | Delete by ids |

## Defer / Enrolled

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/defers` | List deferred students |
| GET | `/api/enrolled` | List enrolled students |

## Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Student invoices |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/:id` | Update / add payment |
| GET | `/api/partner-invoices` | Partner claim invoices |
| GET | `/api/university-commission` | University commission invoices |

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated counts & chart data |

Query: `partnerId`, `branch`, `country`, `intake`

## Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar-events` | List events |
| POST | `/api/calendar-events` | Create event |

## Universities (Masters)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/universities` | Country-wise university counts |
| POST | `/api/universities` | Add university |

## Entity Types

See `src/types/index.ts` for full TypeScript definitions:

- `Enquiry`, `Student`, `Application`, `VisaRecord`
- `DeferRecord`, `EnrolledRecord`
- `Invoice`, `PartnerInvoice`, `UniversityCommission`
- `CalendarEvent`, `User`, `PaginatedResponse<T>`

## ID Formats

- Student: `KRS/S/YY/NNNNN`
- Invoice: `KRS/S/YY/NNNNN-NN`
