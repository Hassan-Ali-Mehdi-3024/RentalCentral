# RentAI Pro - Property Management System

## Overview

RentAI Pro is a comprehensive property management platform built with a modern tech stack. It's designed to streamline rental property operations, lead management, and tenant interactions through an intuitive web interface. The system integrates AI-powered features for feedback analysis, voice scheduling, and automated property management workflows.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Upload**: Multer middleware for handling file uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Schema
The system uses a relational database structure with the following key entities:
- **Properties**: Core property information (name, address, rent, amenities)
- **Leads**: Prospective tenant information and status tracking
- **Agent Schedules**: Availability management for property showings
- **Showing Requests**: Tenant requests for property viewings
- **Scheduled Showings**: Confirmed property showing appointments
- **Feedback Sessions**: Structured feedback collection from prospects
- **Feedback Responses**: Individual responses to feedback questions
- **User Profiles**: Agent/property manager profile information

## Key Components

### Property Management
- Property listings with detailed information and photo management
- Availability tracking and rental pricing
- Bulk property import functionality
- Property performance analytics

### Lead Management
- Lead capture and qualification workflows
- Status tracking through the rental pipeline
- Drag-and-drop assignment to properties
- Contact information and preference management

### Scheduling System
- Voice-activated schedule creation using speech recognition
- Calendar-based showing appointment booking
- Agent availability management
- Popular showing time analytics

### Feedback Collection
- Dynamic questionnaire system for discovery and post-tour feedback
- Multi-modal response collection (text, voice, dropdown, emoji)
- Automated feedback categorization and analysis
- Performance insights based on feedback data

### AI Integration
- OpenAI integration for natural language processing
- Anthropic Claude SDK for advanced AI interactions
- Voice command processing for scheduling
- Automated feedback summary generation

## Data Flow

1. **Property Onboarding**: Properties are added manually or via CSV import
2. **Lead Generation**: Leads are captured through various sources and assigned to properties
3. **Showing Scheduling**: Prospects request showings which are confirmed by agents
4. **Feedback Collection**: Post-showing feedback is collected through dynamic questionnaires
5. **Performance Analysis**: Data is aggregated to provide insights on property performance

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@anthropic-ai/sdk**: AI integration for advanced language processing
- **@sendgrid/mail**: Email service integration
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development
- **Vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- Local development using `npm run dev` with hot module replacement
- Vite dev server with Express API backend
- Type checking with TypeScript compiler

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild for optimal performance
- Database migrations managed through Drizzle Kit
- Environment variables for database connection and API keys

### Database Management
- Schema migrations handled by Drizzle Kit
- Connection pooling through Neon's serverless architecture
- Automated backup and scaling through cloud provider

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 02, 2025. Initial setup