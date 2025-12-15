# EmpowerHer - Women Empowerment & Career Guidance Platform

## Overview

EmpowerHer is a real-time, dynamic web platform designed to empower women through AI-powered career guidance, skill development, and connection with trusted NGOs. The platform helps women discover learning opportunities, find jobs, or start micro-enterprises while connecting them with verified NGOs and government schemes.

**Target Users:**
- Women users (students, career returnees, career switchers, micro-entrepreneurs)
- NGOs and foundations providing courses, workshops, jobs, or awareness programs
- Platform administrators

**Core Features:**
- AI-powered chatbot for personalized career guidance (bilingual: English/Hindi)
- Government schemes discovery
- NGO event listings (courses, workshops, jobs, awareness programs)
- Personalized career roadmaps
- OTP-based phone authentication
- Role-based dashboards (User, NGO)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for warm, accessible aesthetics
- **Theme**: Light/dark mode support with CSS variables
- **Fonts**: Inter (body) and Poppins (headers) via Google Fonts

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Build Tool**: esbuild for server bundling, Vite for client

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)

### Authentication
- Phone OTP-based authentication (simulated Aadhaar-style verification)
- Separate authentication flows for users and NGOs
- JWT tokens stored in localStorage
- No Aadhaar number storage (privacy-first approach)

### Key Data Models
- **Users**: Women seeking guidance (phone, name, skills, interests, location)
- **NGOs**: Verified organizations (registration details, contact info, verification status)
- **Events**: Courses, workshops, jobs, awareness programs from NGOs
- **Chat Sessions**: AI conversation history with messages stored as JSONB
- **Roadmaps**: Personalized 4-6 week career plans
- **Government Schemes**: Curated list of women-focused programs

### Design System
- Material Design-inspired with warm, accessible modifications
- Professional warmth over corporate coldness
- Accessibility-first for diverse literacy levels
- Cultural sensitivity for Indian context
- Color scheme: Pink/rose primary with purple accents

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Session storage: connect-pg-simple for Express sessions

### AI/ML Services
- Google Generative AI (`@google/generative-ai`) - for chatbot functionality
- OpenAI SDK - alternative AI provider support

### Third-Party Libraries
- Drizzle ORM + drizzle-kit for database migrations
- Express with express-session for API and session handling
- Zod for runtime validation
- TanStack Query for data fetching and caching

### Development Tools
- Vite for frontend development and building
- tsx for TypeScript execution
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)