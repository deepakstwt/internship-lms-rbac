# LMS - Learning Management System

A full-stack Learning Management System with Role-Based Access Control (RBAC) built for internship programs.

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- JWT Authentication
- Supabase PostgreSQL
- PDFKit (Certificate Generation)

### Frontend
- React 18 + Vite
- TypeScript
- React Router
- Axios

## Features

### Student
- Register and login
- View assigned courses
- Complete chapters sequentially (locked until previous completed)
- Track progress with percentage
- Download PDF certificate after 100% completion

### Mentor
- Login (created by admin)
- Create and manage courses
- Add chapters with sequence order
- Assign courses to students

### Admin
- View all users
- Approve mentors
- Delete users

## Project Structure

```
internship-lms-rbac/
├── backend/
│   ├── src/
│   │   ├── config/         # Supabase configuration
│   │   ├── middleware/     # Auth & RBAC middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # JWT, password utilities
│   │   └── server.ts       # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── App.tsx         # Main app with routing
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Database Schema

### Tables
- **users** - id, email, password, role (student/mentor/admin), is_approved, created_at
- **courses** - id, title, description, mentor_id, created_at
- **chapters** - id, course_id, title, description, image_url, video_url, sequence_order, created_at
- **course_assignments** - id, course_id, student_id, assigned_at
- **progress** - id, student_id, course_id, chapter_id, completed_at
- **certificates** - id, student_id, course_id, issued_at

## Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account with PostgreSQL database

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

Start server:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Login for all roles

### Courses (Mentor Only)
- `POST /api/courses` - Create course
- `GET /api/courses/my` - Get mentor's courses
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/assign` - Assign course to students

### Chapters (Mentor Only)
- `POST /api/courses/:courseId/chapters` - Add chapter
- `GET /api/courses/:courseId/chapters` - Get chapters

### Student Courses
- `GET /api/student/courses/my` - Get assigned courses
- `GET /api/student/courses/:id` - Get course details
- `GET /api/student/courses/:id/chapters` - Get chapters

### Progress (Student Only)
- `POST /api/progress/:chapterId/complete` - Mark chapter complete
- `GET /api/progress/my` - Get all progress

### Certificates (Student Only)
- `GET /api/certificates/:courseId` - Download certificate PDF

### Users (Admin Only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/approve-mentor` - Approve mentor
- `DELETE /api/users/:id` - Delete user

## Running the Project

1. Start backend:
```bash
cd backend && npm run dev
```

2. Start frontend (new terminal):
```bash
cd frontend && npm run dev
```

3. Open `http://localhost:5173` in browser

## Testing

Backend tests are located in `backend/tests/` and cover:

- Authentication & RBAC enforcement
- Sequential chapter completion logic
- Certificate eligibility validation

Run tests:
```bash
cd backend
npm install
npm test
```

## Deployment

### Backend (Render)

1. Create account at https://render.com
2. Create new **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: `internship-lms-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: (leave empty)
5. Add Environment Variables:
   ```
   PORT=10000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```
6. Deploy

### Frontend (Vercel)

1. Create account at https://vercel.com
2. Create new **Project**
3. Connect GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```
6. Deploy

**Important**: After deployment, update `FRONTEND_URL` in Render with your Vercel URL.

## Test Credentials

Create users in Supabase or use:
- Register as student via `/register`
- Create mentor/admin directly in database with hashed password

## My AI Usage

**AI Tools Used:**
- GitHub Copilot (for code autocomplete)
- ChatGPT (for clarifying TypeScript type errors, Jest mocking patterns, and TDD concepts)

**How AI Was Used:**
- **Minimal assistance** with TypeScript type definitions and error resolution
- **Code review** for Jest test setup, Supabase mocking patterns, and TDD approach
- **Documentation** help with README structure
- **Learning** TDD best practices and test structure

**Reflection:**
AI was used sparingly, primarily as a learning tool to understand TypeScript type system, Jest testing patterns, and TDD methodology. The core business logic, RBAC implementation, database schema design, and API architecture were developed independently. AI helped accelerate debugging, understanding testing frameworks, and learning TDD concepts, but all design decisions and implementation were made manually.

## License

MIT
