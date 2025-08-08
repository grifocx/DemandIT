# Overview

Demand-IT is a strategic portfolio management application designed to provide a lightweight alternative to complex enterprise SPM (Strategic Portfolio Management) tools like ServiceNow. The system manages the complete hierarchy of IT investments from portfolios down to individual projects, with demand pipeline management and role-based access control.

The application follows a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM. It provides comprehensive portfolio oversight, program management, demand tracking, and project execution capabilities with built-in authentication via Replit's OIDC system.

# User Preferences

Preferred communication style: Simple, everyday language.
Product branding: "Demand-IT" (updated January 2025)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing without the overhead of React Router
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for consistent, accessible design
- **Form Handling**: React Hook Form with Zod validation for robust form management and validation
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Authentication**: Replit's OIDC integration with session-based authentication using express-session
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

## Data Architecture
The system implements a hierarchical data model:
- **Portfolios** contain multiple Programs
- **Programs** contain both Demands and Projects  
- **Demands** represent ideas/requests that can be converted to Projects
- **Projects** are active initiatives with phases, statuses, and assignments
- **Users** have role-based permissions (admin, portfolio_manager, program_manager, project_manager, contributor)
- **Audit Log** tracks all changes across entities for compliance and history

## Database Schema Design
- **Normalized relational structure** with proper foreign key relationships
- **UUID primary keys** for all entities to ensure scalability
- **Timestamp tracking** for created_at and updated_at on all major entities
- **Flexible status/phase system** with separate lookup tables for extensibility
- **Assignment model** supporting multiple roles per project/demand

## Authentication & Authorization
- **OIDC Integration**: Uses Replit's OpenID Connect for secure authentication
- **Session Management**: Server-side sessions stored in PostgreSQL for security
- **Role-Based Access**: Five-tier role system with appropriate permissions for each level
- **Route Protection**: All API endpoints require authentication with role-based filtering

## Development & Deployment Architecture
- **Development**: Vite dev server with hot module replacement and error overlays
- **Production Build**: Separate client (Vite) and server (esbuild) build processes
- **Database Migrations**: Drizzle Kit for schema management and version control
- **Environment Configuration**: Environment variables for database connection and authentication secrets

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling via @neondatabase/serverless
- **Connection Management**: WebSocket-based connections for optimal performance

## Authentication Provider  
- **Replit OIDC**: Integrated OpenID Connect authentication using Replit's identity system
- **Session Store**: PostgreSQL-backed session storage for scalability and persistence

## UI Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives for complex components (dialogs, dropdowns, forms)
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast bundling for server-side code
- **Replit Plugins**: Integration with Replit's development environment and error reporting

## Third-Party Utilities
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation for various purposes
- **memoizee**: Function memoization for performance optimization
- **zod**: Runtime type validation and schema definition

# Testing & Quality Assurance

## Test Plan
A comprehensive test plan is available in `TEST_PLAN.md` covering all current functionality:
- Authentication and authorization flows
- Complete CRUD operations for all entities (Portfolios, Programs, Demands, Projects)
- Data relationships and hierarchy validation
- UI/UX testing including responsive design
- Error handling and form validation
- Role-based access control testing
- Performance and browser compatibility testing

The test plan includes 12 major test categories with detailed test cases, expected results, and success criteria for ensuring all features work correctly before deployment or major releases.

# Recent Changes

## January 2025
- **Branding Update**: Changed product name from "IT Portfolio Manager" to "Demand-IT" across all UI components, navigation, landing page, and documentation
- **Test Plan Creation**: Comprehensive test plan document created covering all existing functionality for quality assurance