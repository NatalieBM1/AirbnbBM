# Overview

This is an Airbnb-inspired accommodation booking platform called "airbnbbm" built with a modern full-stack architecture. The application allows users to browse properties, make bookings, handle payments, and manage notifications in a responsive web interface similar to Airbnb.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with **React** using TypeScript and modern tooling:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: React Context API for authentication state, TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system variables following Airbnb's visual design
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side uses **Node.js** with Express in a REST API pattern:
- **Framework**: Express.js with TypeScript for type safety
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Data Storage**: Neon serverless PostgreSQL database
- **API Design**: RESTful endpoints for auth, properties, bookings, notifications, and payments
- **Development Storage**: In-memory storage implementation for development/testing

## Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Authentication, profile data, host/guest roles
- **Properties**: Accommodation listings with location, pricing, images, and amenities
- **Bookings**: Reservation records linking guests to properties with date ranges
- **Notifications**: User-specific messages and alerts
- **Payments**: Transaction records for booking payments

Database migrations are managed through Drizzle Kit with schema definitions in TypeScript.

## Authentication & Authorization
- **JWT-based authentication** with secure token storage
- **Role-based access** distinguishing between guests and hosts
- **Protected routes** on both client and server sides
- **Session management** with automatic token refresh handling

## External Dependencies

- **Database**: Neon PostgreSQL serverless database (@neondatabase/serverless)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Maps Integration**: Placeholder implementation ready for Google Maps or Mapbox integration
- **Payment Processing**: Architecture prepared for Stripe or similar payment gateway integration
- **Image Storage**: Currently uses placeholder URLs, ready for cloud storage integration (AWS S3, Cloudinary)
- **Development Tools**: Replit-specific plugins for development environment integration

## Key Design Decisions

**Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories for code organization and type sharing.

**Type Safety**: End-to-end TypeScript with shared schema definitions between frontend and backend using Zod for validation.

**Component Architecture**: Modular UI components with shadcn/ui for consistency and Radix UI for accessibility compliance.

**Database Strategy**: Drizzle ORM chosen for type safety and PostgreSQL compatibility, with fallback in-memory storage for development.

**Authentication Flow**: JWT tokens with localStorage persistence and React Context for state management across the application.

**Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints matching modern device viewports.