# Rental Central - Property Management Platform

## Overview

Rental Central is a comprehensive rental property management platform built with Next.js 15, TypeScript, and SQLite. It provides tools for property management, lead tracking, showing scheduling, feedback collection, and performance analytics.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT with Jose library
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── properties/    # Property management
│   │   ├── leads/         # Lead management
│   │   ├── showings/      # Showing scheduling
│   │   ├── profile/       # User profile management
│   │   └── dashboard/     # Dashboard statistics
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── signup/           # Registration page
├── components/            # Reusable UI components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
└── shared/               # Shared schemas and types
```

## Database Schema

### Core Tables

#### Users (`users`)
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE, NOT NULL)
- `passwordHash` (TEXT, NOT NULL)
- `isEmailVerified` (BOOLEAN, DEFAULT FALSE)
- `emailVerificationToken` (TEXT)
- `emailVerificationExpires` (TIMESTAMP)
- `resetPasswordToken` (TEXT)
- `resetPasswordExpires` (TIMESTAMP)
- `lastLoginAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

#### User Profiles (`user_profiles`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `userId` (TEXT, FOREIGN KEY → users.id)
- `isLicensedAgent` (BOOLEAN, NOT NULL)
- `firstName` (TEXT, NOT NULL)
- `lastName` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `phone` (TEXT)
- `profileImageUrl` (TEXT)
- **Agent Fields**: `licenseNumber`, `licenseState`, `licenseExpiration`, `brokerageName`, `brokerageAddress`, `brokeragePhone`, `yearsExperience`, `specialties`
- **Property Owner Fields**: `companyName`, `businessAddress`, `numberOfProperties`, `propertyTypes`
- **Common Fields**: `bio`, `website`, `socialMediaLinks`, `lastLoginAt`, `createdAt`, `updatedAt`

#### Properties (`properties`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `name` (TEXT, NOT NULL)
- `address` (TEXT, NOT NULL)
- `bedrooms` (TEXT, NOT NULL)
- `rent` (REAL, NOT NULL)
- `imageUrl` (TEXT)
- `description` (TEXT)
- `available` (BOOLEAN, DEFAULT TRUE)
- **Zillow Integration**: `zillowId`, `zillowUrl`, `listingStatus`, `bathrooms`, `squareFootage`, `photos`, `amenities`, `isAvailable`, `rentEstimate`, `valueEstimate`, `lastSyncedAt`

#### Leads (`leads`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `phone` (TEXT)
- `status` (TEXT, NOT NULL, DEFAULT 'new')
- `source` (TEXT)
- `preferences` (TEXT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `notes` (TEXT)

### Scheduling Tables

#### Agent Schedules (`agent_schedules`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `dayOfWeek` (INTEGER, 0-6 for Sunday-Saturday)
- `startTime` (TEXT, HH:MM format)
- `endTime` (TEXT, HH:MM format)
- `isActive` (BOOLEAN, DEFAULT TRUE)

#### Showing Requests (`showing_requests`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `leadId` (INTEGER, FOREIGN KEY → leads.id)
- `requestedDate` (TEXT, YYYY-MM-DD format)
- `requestedTime` (TEXT, HH:MM format)
- `status` (TEXT, DEFAULT 'pending')
- `createdAt` (TIMESTAMP)

#### Scheduled Showings (`scheduled_showings`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `showingDate` (TEXT, YYYY-MM-DD format)
- `showingTime` (TEXT, HH:MM format)
- `duration` (INTEGER, DEFAULT 30 minutes)
- `status` (TEXT, DEFAULT 'scheduled')
- `createdAt` (TIMESTAMP)

### Feedback & Analytics Tables

#### Feedback Sessions (`feedback_sessions`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `leadId` (INTEGER, FOREIGN KEY → leads.id)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `sessionType` (TEXT, 'discovery' | 'post_tour')
- `status` (TEXT, 'active' | 'completed' | 'abandoned')
- `preferredResponseMethod` (TEXT, 'voice' | 'text' | 'dropdown' | 'emoji')
- `currentQuestionIndex` (INTEGER, DEFAULT 0)
- `sessionData` (TEXT, JSON string)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

#### Feedback Responses (`feedback_responses`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `sessionId` (INTEGER, FOREIGN KEY → feedback_sessions.id)
- `questionText` (TEXT, NOT NULL)
- `responseText` (TEXT)
- `responseMethod` (TEXT, NOT NULL)
- `aiGeneratedQuestion` (BOOLEAN, DEFAULT TRUE)
- `metadata` (TEXT, JSON)
- `createdAt` (TIMESTAMP)

#### Property Performance (`property_performance`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `vacancyDate` (TEXT, YYYY-MM-DD format)
- `inquiryCount` (INTEGER, DEFAULT 0)
- `tourCount` (INTEGER, DEFAULT 0)
- `lastUpdated` (TIMESTAMP)

#### Feedback Summaries (`feedback_summaries`)
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `propertyId` (INTEGER, FOREIGN KEY → properties.id)
- `category` (TEXT, 'price' | 'amenities' | 'location' | 'size' | 'comparison' | 'suggestions')
- `summaryText` (TEXT, NOT NULL)
- `isEdited` (BOOLEAN, DEFAULT FALSE)
- `editedBy` (TEXT)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## API Endpoints

### Authentication (`/api/auth`)

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/me` - Get current user info
- **POST** `/api/auth/verify-email` - Verify email address
- **POST** `/api/auth/resend-verification` - Resend verification email

### Properties (`/api/properties`)

- **GET** `/api/properties` - List properties with pagination and filtering
- **POST** `/api/properties` - Create new property
- **GET** `/api/properties/[id]` - Get property by ID
- **PUT** `/api/properties/[id]` - Update property
- **DELETE** `/api/properties/[id]` - Delete property

### Leads (`/api/leads`)

- **GET** `/api/leads` - List leads with pagination and filtering
- **POST** `/api/leads` - Create new lead
- **GET** `/api/leads/[id]` - Get lead by ID
- **PUT** `/api/leads/[id]` - Update lead
- **DELETE** `/api/leads/[id]` - Delete lead

### Showings (`/api/showings`)

- **GET** `/api/showings` - List scheduled showings
- **POST** `/api/showings` - Schedule new showing
- **GET** `/api/showings/[id]` - Get showing by ID
- **PUT** `/api/showings/[id]` - Update showing
- **DELETE** `/api/showings/[id]` - Cancel showing

### Profile (`/api/profile`)

- **GET** `/api/profile` - Get user profile
- **POST** `/api/profile` - Create user profile
- **PUT** `/api/profile` - Update user profile

### Dashboard (`/api/dashboard`)

- **GET** `/api/dashboard/stats` - Get dashboard statistics

## Core Features Implemented

### ✅ Authentication System
- JWT-based authentication with refresh tokens
- Email verification
- Password reset functionality
- Protected routes middleware
- Rate limiting for security

### ✅ Property Management
- CRUD operations for properties
- Zillow integration for property data sync
- Property search and filtering
- Image upload support
- Property performance tracking

### ✅ Lead Management
- Lead capture and tracking
- Lead status management
- Lead assignment to properties
- Lead source tracking
- Notes and preferences storage

### ✅ Showing Scheduling
- Agent schedule management
- Showing request handling
- Calendar integration
- Automated scheduling
- Status tracking

### ✅ Feedback System
- Interactive feedback questionnaires
- Multiple response methods (voice, text, dropdown, emoji)
- AI-generated questions
- Feedback categorization
- Performance analytics

### ✅ User Profiles
- Agent and property owner profiles
- License management for agents
- Company information for property owners
- Profile customization

### ✅ Dashboard & Analytics
- Property performance metrics
- Lead conversion tracking
- Inquiry and tour statistics
- Rental income charts
- Feedback summaries

## Core Libraries & Services

### Database Service (`/lib/database.ts`)
- **DatabaseService class** with methods for:
  - `getProperties()` - Paginated property listing with filters
  - `getPropertyById()` - Single property retrieval
  - `createProperty()` - Property creation
  - `updateProperty()` - Property updates
  - `deleteProperty()` - Property deletion
  - `getLeads()` - Lead management operations
  - `getShowings()` - Showing management operations
  - `getUserProfile()` - Profile management

### Authentication Service (`/lib/auth.ts`)
- **AuthService class** with methods:
  - `authenticate()` - User login
  - `createAccessToken()` / `createRefreshToken()` - JWT token generation
  - `verifyAccessToken()` / `verifyRefreshToken()` - Token validation
  - `createSession()` - Session management
  - `getCurrentUser()` - User info retrieval
  - `hashPassword()` / `verifyPassword()` - Password handling
  - `validatePassword()` - Password strength validation
  - `checkRateLimit()` - Security rate limiting

### Cache Service (`/lib/cache.ts`)
- **Cache class** with LRU caching:
  - `get()` / `set()` - Basic cache operations
  - `delete()` / `clear()` - Cache invalidation
  - `getStats()` - Cache performance metrics
  - TTL support and automatic cleanup

### API Client (`/lib/api.ts`)
- Centralized API client with methods for:
  - Authentication operations
  - Property CRUD operations
  - Lead management
  - Showing scheduling
  - Profile management
  - Dashboard statistics

## UI Components

### Core Components
- **PropertyCard** - Property display component
- **FeedbackQuestionnaire** - Interactive feedback forms
- **ZillowIntegration** - Zillow API integration component
- **InquiryTracking** - Lead inquiry tracking
- **FeedbackCategories** - Feedback categorization
- **RentalIncomeChart** - Financial analytics charts
- **Header** - Application header with navigation
- **Navigation** - Main navigation component

### UI Library (`/components/ui`)
- Radix UI-based components:
  - Button, Input, Select, Checkbox, Radio Group
  - Toast notifications
  - Form components
  - Layout components

## Configuration

### Environment Variables
```env
JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
DATABASE_URL=./rental-central.db
```

### Constants (`/lib/constants.ts`)
- **APP_CONFIG** - Application metadata
- **AUTH_CONFIG** - Authentication settings
- **PAGINATION** - Default pagination settings
- **RATE_LIMITS** - Security rate limiting
- **CACHE_KEYS** - Cache key definitions
- **VALIDATION_RULES** - Form validation rules
- **ERROR_MESSAGES** - Standardized error messages

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rental-central-nextjs
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Initialize the database
```bash
npm run db:generate
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Commands
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Future Features & Roadmap

### 🔄 In Progress
- [ ] Advanced property search with map integration
- [ ] Automated email notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

### 📋 Planned Features

#### Property Management Enhancements
- [ ] Bulk property import/export
- [ ] Property comparison tools
- [ ] Virtual tour integration
- [ ] Property maintenance tracking
- [ ] Lease management system
- [ ] Tenant portal

#### Lead Management Improvements
- [ ] Lead scoring algorithm
- [ ] Automated lead nurturing
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Lead source attribution
- [ ] Conversion funnel analytics

#### Communication Features
- [ ] SMS notifications
- [ ] WhatsApp integration
- [ ] Video call scheduling
- [ ] Automated follow-up sequences
- [ ] Email templates
- [ ] Push notifications

#### Advanced Analytics
- [ ] Predictive analytics
- [ ] Market trend analysis
- [ ] ROI calculations
- [ ] Custom reporting
- [ ] Data export capabilities
- [ ] Performance benchmarking

#### Integration & APIs
- [ ] MLS integration
- [ ] Zillow Premier Agent API
- [ ] Google Calendar sync
- [ ] Outlook integration
- [ ] Zapier webhooks
- [ ] Third-party CRM connectors

#### Mobile Features
- [ ] React Native mobile app
- [ ] Offline capability
- [ ] Push notifications
- [ ] Camera integration for property photos
- [ ] GPS-based property check-ins

#### Security & Compliance
- [ ] Two-factor authentication
- [ ] GDPR compliance tools
- [ ] Audit logging
- [ ] Role-based permissions
- [ ] Data encryption at rest
- [ ] SOC 2 compliance

#### User Experience
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Progressive Web App (PWA)
- [ ] Advanced search filters
- [ ] Saved searches

#### Business Intelligence
- [ ] Custom dashboard builder
- [ ] Automated reports
- [ ] KPI tracking
- [ ] Competitor analysis
- [ ] Market insights
- [ ] Revenue forecasting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@rentalcentral.com or create an issue in the repository.

---

**Rental Central Team**  
Version 1.0.0  
Built with ❤️ using Next.js and TypeScript
