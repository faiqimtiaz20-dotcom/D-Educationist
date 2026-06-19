# KRS Infotech CRM — Frontend

Modern React frontend for the KRS Infotech visa consultancy CRM with **Admin**, **Partner**, and **Student** portals.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Radix)
- React Router v6, TanStack Query & Table
- React Hook Form + Zod
- Recharts, FullCalendar
- MSW (mock API in development)
- Zustand (auth & UI state)

## Getting Started

```bash
cd Frontend/krs-crm-ui
npm install
npm run dev
```

Open [http://localhost:5173/login](http://localhost:5173/login)

### Mock Login Credentials

| Portal | Username (any) | Password |
|--------|----------------|----------|
| CRM (Admin) | `admin` | `admin123` |
| Partner | `partner` | `partner123` |
| Student | `student` | `student123` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with MSW mocks |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── app/           # Router, providers, App entry
├── components/    # UI primitives, layout, shared widgets
├── features/      # Portal-specific pages
│   ├── admin/     # Re-exports full admin implementations
│   ├── partner/   # Partner portal wrappers
│   ├── student/   # Student portal (mobile-first)
│   └── auth/      # Login, forgot password
├── mocks/         # MSW handlers + JSON fixtures
├── services/      # API service layer
├── stores/        # Zustand stores
├── types/         # TypeScript interfaces
└── lib/           # Constants, utils
```

## Portals & Routes

### Admin (`/admin/*`)
Dashboard, Calendar, Enquiry, Student, Application, Visa, Defer/Enrolled, Accounts, University Commission, Reports, File Manager, Master's, Integrations, Marketing, Tasks, Course Finder

### Partner (`/partner/*`)
Scoped dashboard, enquiries, students, applications, visa, defer/enrolled, invoices, files, reports

### Student (`/student/*`)
Mobile-first dashboard, profile, applications, visa, documents, invoices, appointments, resources, announcements

## Responsive Design

- **Desktop/Laptop (≥1024px):** Fixed sidebar, full data tables
- **Tablet (768–1023px):** Drawer sidebar, 2-column cards
- **Mobile (<768px):** Hamburger menu, card list views, student bottom nav

## API Integration

All data is mocked via MSW in development. To connect a real backend:

1. Set `VITE_API_URL` in `.env`
2. Update `src/services/api.ts` base URL
3. Remove MSW bootstrap from `src/main.tsx`

See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) for endpoint specifications.

## Reference UI

Admin screens are based on PNG mockups in the parent `KRS/` folder (login, dashboard, enquiry, student, application, visa, accounts, etc.).
