# Triponic - Enterprise B2B Travel Management Platform

## Overview
Triponic is a comprehensive enterprise-grade B2B travel platform featuring AI-powered itinerary generation, CRM for managing clients and leads, invoicing with Stripe payment integration, client portal, and analytics dashboard with revenue/destination metrics.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: Google Gemini API (gemini-1.5-flash model)
- **Payments**: Stripe
- **State Management**: TanStack Query v5
- **Routing**: Wouter

### Design System
- **Design Language**: Material Design 3 foundation
- **Brand Colors**: Purple/pink gradient branding
- **Typography**: Inter for UI/body text, DM Sans for headings
- **Component Library**: shadcn/ui with custom Material Design 3 theming

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── DashboardKPICard.tsx
│   │   │   ├── ClientListTable.tsx
│   │   │   ├── InvoiceListTable.tsx
│   │   │   ├── ItineraryCard.tsx
│   │   │   ├── AnalyticsChart.tsx
│   │   │   ├── AIChatInterface.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── pages/           # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CRMPage.tsx
│   │   │   ├── InvoicesPage.tsx
│   │   │   └── AIPlannerPage.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useAuth.ts
│   │   ├── lib/             # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── authUtils.ts
│   │   └── App.tsx          # Main app component
├── server/
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Database operations
│   ├── replitAuth.ts        # Replit Auth configuration
│   ├── stripe.ts            # Stripe integration
│   ├── db.ts                # Database connection
│   └── index.ts             # Server entry point
└── shared/
    └── schema.ts            # Drizzle ORM schemas & Zod validation

```

## Database Schema

### Users Table
- Managed by Replit Auth
- Fields: id, email, firstName, lastName, profileImageUrl, role, createdAt, updatedAt
- Role-based access: admin, agent, client

### Clients Table
- CRM client/lead management
- Fields: id, name, email, phone, company, status, notes, createdAt, updatedAt
- Status: lead, active, inactive

### Itineraries Table
- Trip planning and management
- Fields: id, clientId, destination, startDate, endDate, travelers, budget, status, content, imageUrl, createdAt, updatedAt
- Status: draft, confirmed, completed

### Invoices Table
- Billing and payment tracking
- Fields: id, invoiceNumber, clientId, itineraryId, amount, status, dueDate, paidAt, stripePaymentIntentId, createdAt, updatedAt
- Status: pending, paid, overdue

### Chat Sessions Table
- AI conversation history
- Fields: id, userId, clientId, messages (JSON), createdAt, updatedAt

### Sessions Table
- Authentication session storage (managed by Replit Auth)

## API Routes

### Authentication
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Logout and clear session
- `GET /api/auth/user` - Get current user info

### Clients (CRM)
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create new client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Itineraries
- `GET /api/itineraries` - List all itineraries
- `GET /api/itineraries/:id` - Get itinerary details
- `POST /api/itineraries` - Create new itinerary
- `PATCH /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create new invoice
- `PATCH /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/pay` - Initiate payment for invoice

### AI Travel Planning
- `POST /api/llm/generate-itinerary` - Generate AI-powered itinerary
  - Server-side Gemini API integration (no frontend API keys)
  - Request body: { messages, destination, budget, duration, travelers, preferences }
  - Response: Comprehensive day-by-day itinerary with recommendations

### Payments (Stripe)
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Chat Sessions
- `GET /api/chat-sessions` - Get user's chat sessions
- `POST /api/chat-sessions` - Create new chat session
- `PATCH /api/chat-sessions/:id` - Update chat session

### Analytics
- `GET /api/analytics/overview` - Dashboard metrics (revenue, clients, trips, conversion rate)

## Environment Variables

### Required (Already Configured)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `GEMINI_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (frontend)
- `ISSUER_URL` - Replit Auth OIDC issuer URL
- `REPL_ID` - Replit app ID

## Key Features

### 1. AI-Powered Itinerary Generation
- Uses Google Gemini 1.5 Flash model
- Server-side LLM integration (no frontend API keys exposed)
- Contextual chat-based planning
- Generates comprehensive day-by-day itineraries with:
  - Daily activities and attractions
  - Restaurant recommendations
  - Accommodation suggestions
  - Transportation tips
  - Budget breakdowns
  - Packing lists
  - Local tips and cultural insights

### 2. CRM & Client Management
- Full CRUD operations for clients/leads
- Status tracking (lead, active, inactive)
- Client search and filtering
- Company and contact information management
- Activity history tracking

### 3. Invoicing & Payments
- Create and manage invoices
- Stripe payment integration
- Payment intent creation
- Webhook handling for payment status updates
- Invoice PDF generation (planned)
- Payment history tracking

### 4. Analytics Dashboard
- Real-time KPI cards (revenue, clients, trips, conversion rate)
- Revenue trends (line charts)
- Top destinations (bar charts)
- Client metrics
- Trip statistics

### 5. Role-Based Access Control
- Admin: Full platform access
- Agent: Manage clients, itineraries, invoices
- Client: View assigned trips and invoices (client portal - planned)

## User Authentication Flow

1. User visits `/` - redirected to login page if not authenticated
2. Click "Sign In" button navigates to `/api/login`
3. Replit Auth handles OAuth flow (Google, GitHub, etc.)
4. Callback to `/api/callback` creates/updates user in database
5. Session stored in PostgreSQL
6. User redirected to dashboard
7. Logout via `/api/logout` clears session and redirects

## Development

### Running the Application
```bash
npm run dev
```
Starts Express server on port 5000 with Vite dev server for frontend.

### Database Migrations
```bash
npm run db:push
```
Syncs Drizzle schema to PostgreSQL database.

## Recent Changes

### November 9, 2025
- Implemented complete database schema with Drizzle ORM
- Set up Replit Auth integration with session management
- Created all API routes for clients, itineraries, invoices, payments
- Integrated Google Gemini API for AI itinerary generation
- Implemented Stripe payment processing
- Connected frontend to backend with TanStack Query
- Added authentication hooks and utilities
- Created comprehensive component library
- Implemented analytics dashboard

## User Preferences
- Material Design 3 aesthetic with travel industry focus
- Purple/pink gradient branding (#8B5CF6 primary, pink accents)
- Clean, modern UI with Inter/DM Sans typography
- Server-side LLM integration (security best practice)
- Enterprise-grade features with B2B focus

## Next Steps
- Integrate user-provided ChatBot.tsx and GeneratedItinerary.tsx components
- Implement PDF generation for invoices
- Add client portal features
- Enhance analytics with more metrics
- Add advanced search and filtering
- Implement real-time notifications
- Add file upload for trip documents
- Multi-currency support
