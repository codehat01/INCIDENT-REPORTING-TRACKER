# Secure Incident Reporting Tracker

A full-stack web application for secure incident reporting and tracking with role-based access control (RBAC). Built with React, TypeScript, and Supabase.

## Features

- **JWT Authentication** - Secure email/password authentication with session management
- **Role-Based Access Control** - Four user roles: Reporter, Responder, Manager, Admin
- **Incident Management** - Create, track, and manage incidents with status workflows
- **Real-time Comments** - Threaded commenting system for incident discussions
- **File Attachments** - Secure file upload and management (planned)
- **Audit Logging** - Comprehensive tracking of all system changes
- **Responsive Design** - Mobile-friendly UI with TailwindCSS

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, React Router
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Security**: JWT tokens, RLS policies, input validation

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Reporter** | Create incidents, view own incidents, add comments |
| **Responder** | View assigned incidents, update status, add comments |
| **Manager** | View team incidents, assign responders, update statuses |
| **Admin** | Full CRUD on users, incidents, comments, and configurations |

## Database Schema

The application uses 5 main tables:
- `profiles` - User profiles with role and team assignments
- `incidents` - Core incident tracking
- `comments` - Threaded comments on incidents
- `attachments` - File attachment metadata
- `audit_logs` - System activity tracking

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account

### 1. Database Setup

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Execute the SQL to create all tables, policies, and triggers

### 2. Environment Variables

The `.env` file is already configured with Supabase credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## First Time Usage

1. Navigate to the signup page
2. Create an account (choose Reporter or Responder role)
3. For admin access, manually update the role in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE username = 'your-username';
   ```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── context/         # React context providers
│   └── AuthContext.tsx
├── lib/            # External library configurations
│   └── supabase.ts
├── pages/          # Route pages
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── IncidentList.tsx
│   ├── NewIncident.tsx
│   ├── IncidentDetail.tsx
│   ├── UserManagement.tsx
│   └── AuditLog.tsx
├── types/          # TypeScript type definitions
│   └── index.ts
├── utils/          # Utility functions
│   ├── constants.ts
│   └── helpers.ts
├── App.tsx         # Main app component with routing
└── main.tsx        # Application entry point
```

## Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Stateless, secure token-based auth
- **Input Validation** - Client and server-side validation
- **Audit Logging** - Automatic tracking of sensitive operations
- **Role-Based Authorization** - Route and action-level permissions

## API Routes

All data operations go through Supabase's auto-generated REST API with RLS enforcement:

- Authentication: Supabase Auth API
- Incidents: `/rest/v1/incidents`
- Comments: `/rest/v1/comments`
- Users: `/rest/v1/profiles`
- Audit Logs: `/rest/v1/audit_logs`

## Incident Status Flow

```
New → Triaged → In Progress → Resolved → Closed
```

## Severity Levels

- **Low** - Minor issues with minimal impact
- **Medium** - Standard issues requiring attention
- **High** - Significant issues affecting operations
- **Critical** - Urgent issues requiring immediate action

## Contributing

This is a demonstration project. For production use:

1. Add comprehensive error handling
2. Implement file attachment storage
3. Add email notifications
4. Implement advanced search and filtering
5. Add real-time updates with Supabase subscriptions
6. Implement rate limiting
7. Add comprehensive testing

## License

ISC
