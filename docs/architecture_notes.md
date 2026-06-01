# Architecture Notes — PPES Platform

This document describes the high-level system architecture, deployment topology, key data flow patterns, module boundaries, and architectural decisions derived from the actual source code.

---

## 1. System Overview

PPES is a **multi-portal**, **role-separated** monorepo with two independently deployable services that share the same MongoDB Atlas database.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────┬──────────────────────────────┬─────────────────┘
                │  HTTPS (SSR / CSR)            │  Razorpay SDK
                ▼                              ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   Next.js 14 Frontend    │      │     Razorpay Payment Gateway  │
│   (App Router, Port 3000)│      └──────────────────────────────┘
│                          │
│  ┌────────────────────┐  │  Next.js Server Actions (direct DB)
│  │  Middleware.ts     │  │◄──────────────────────────────────────┐
│  │  (JWT Gate / RBAC) │  │                                       │
│  └────────────────────┘  │                                       │
│                          │  fetch() REST calls                   │
│  Client Components ──────┼────────────────────────►  Express.js  │
│  Server Components       │                         API Server    │
│  Server Actions ─────────┼──────────────────────►  Port 5000    │
└──────────────────────────┘                                       │
                                                                   │
                                      ┌────────────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   MongoDB Atlas        │
                          │   (Shared Database)    │
                          └───────────────────────┘
```

---

## 2. Frontend Architecture (Next.js 14)

### Route Structure

```
app/
├── (auth)/                  # Public login pages (no layout chrome)
│   └── login/
│       ├── student/
│       ├── faculty/
│       └── admin_login/
├── (main)/                  # Public marketing pages (Navbar + Footer)
│   ├── page.tsx             # Landing page
│   ├── about/
│   ├── contact/
│   └── join/
├── admin/                   # Admin portal (requires role=admin JWT)
│   └── (dashboard)/
│       ├── layout.tsx       # Admin sidebar layout (AppSidebar)
│       ├── page.tsx         # Dashboard overview
│       ├── courses/
│       ├── events/
│       ├── faculty/
│       ├── payments/
│       ├── tests/
│       │   └── create/
│       └── users/
├── student/                 # Student portal (requires role=student JWT)
│   ├── layout.tsx           # Student sidebar layout (StudentSidebar)
│   ├── page.tsx             # Student dashboard
│   ├── courses/
│   ├── doubts/
│   ├── events/
│   ├── profile/
│   ├── tests/
│   │   └── [id]/            # Take a test by ID
│   └── timetable/           # Re-exports dashboard/student/timetable
├── faculty/                 # Faculty portal (requires role=faculty JWT)
│   └── layout.tsx           # Faculty sidebar layout (FacultySidebar)
├── dashboard/               # Timetable sub-pages (Server Components, direct DB)
│   ├── admin/timetable/
│   ├── faculty/
│   └── student/timetable/
└── live/                    # Live class room (Stream Video SDK)
```

### Authentication Middleware (`frontend/middleware.ts`)

- Runs on all paths matching `/student/*`, `/admin/*`, `/faculty/*`, `/live/*`, `/login/*`, `/`
- Reads `token` cookie, verifies JWT with `jose.jwtVerify()`
- Redirects unauthenticated requests to the appropriate login page
- Enforces **role-based dashboard isolation** (admin cannot access `/student`, student cannot access `/admin`)
- Authenticated users on login pages are redirected to their dashboard

### Data Access Patterns

| Pattern | Used For | Example |
|---|---|---|
| **Client Component + `fetch()`** | Real-time student/admin data | Student tests list, admin dashboard stats |
| **Server Actions (direct MongoDB)** | Timetable (bypasses Express) | `getStudentTimetable()`, `upsertSlotAction()` |
| **Next.js Server Components** | Static/read-only dashboard frames | Admin timetable grid |

---

## 3. Backend Architecture (Express.js)

### Route Mounting (`server.js`)

| Mount Point | Router File | Auth |
|---|---|---|
| `POST /api/auth/login` | Inline (server.js) | None |
| `GET/POST /api/users` | Inline (server.js) | None |
| `GET /api/attendance` | Inline (server.js) | None |
| `POST /api/live/token` | Inline (server.js) | None |
| `GET/POST /api/live/sessions` | Inline (server.js) | None |
| `PATCH /api/live/sessions/:id/status` | Inline (server.js) | None |
| `GET/PATCH /api/v1/profile/me` | Inline (server.js) | JWT Required |
| `POST/GET /api/admin/faculty` | Inline (server.js) | None |
| `PUT/DELETE /api/admin/faculty/:id` | Inline (server.js) | None |
| `/api/courses` | courseRoutes.js | None |
| `/api/subjects` | subjectRoutes.js | None |
| `/api/materials` | materialRoutes.js | None |
| `/api/tests` | testRoutes.js | None |
| `/api/events` | eventRoutes.js | None |
| `/api/v1/payment` | paymentRoutes.js | Varies per endpoint |
| `/api/v1/payments` | paymentRoutes.js | Varies per endpoint |
| `/api/v1/doubts` | doubtRoutes.js | JWT Required (all) |
| `/api/v1/messages` | messageRoutes.js | JWT Required (all) |
| `/api/v1/upload` | uploadRoutes.js | None |
| `/api/v1/subjects` | Inline (server.js) | None |
| `/api/v1/teachers` | Inline (server.js) | None |

> [!NOTE]
> Most route groups lack auth middleware. The `/api/v1/doubts`, `/api/v1/messages`, and `/api/v1/payment/verify` routes are the primary secured endpoints.

---

## 4. Authentication Architecture

```
┌──────────────┐    POST /api/auth/login     ┌──────────────────┐
│   Browser    │ ─────────────────────────► │   Express (5000)  │
│              │  { email, password, role }  │                  │
│              │                             │  1. Find User     │
│              │                             │  2. bcrypt.compare│
│              │ ◄───────────────────────── │  3. USN Email     │
│              │  { user: {id,name,role} }   │     (if student,  │
│              │                             │      first login) │
└──────────────┘                             └──────────────────┘
       │
       │ (Next.js Server Action: loginAction)
       │
       ▼
┌─────────────────────────────────────────┐
│  Next.js Server: sign JWT               │
│  Payload: { userId, role, name }        │
│  Expiry: 24h                            │
│                                         │
│  Set cookies:                           │
│  - token (httpOnly: false, 24h)         │
│  - user-data (httpOnly: false, 24h)     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Subsequent Requests:                   │
│  - middleware.ts verifies token with    │
│    jose (frontend RBAC)                 │
│  - API calls send token as:             │
│    Authorization: Bearer <jwt>          │
│    OR x-user-id / x-user-role headers   │
│  - backend/middleware/auth.js verifies  │
│    with jsonwebtoken                    │
└─────────────────────────────────────────┘
```

---

## 5. Payment Architecture (Razorpay)

The payment flow is a **3-party verification** pattern to prevent client-side tampering:

```
Browser ──(1)──► Next.js ──(2)──► Express POST /create-order ──► Razorpay API
                                                                        │
Browser ◄──────────────────────────────── order_id, amount ────────────┘
   │
   └──(3)── Open Razorpay Modal (checkout.js)
                    │
               User Pays
                    │
   ┌────────────────┘
   ▼
Browser POST /api/v1/payment/verify ──► Express
                                          │
                                     HMAC Verify (sha256)
                                          │
                                     Payment.create()
                                          │
                                     User.unlockedCourses.push(courseId)
                                          │
Browser ◄─────── { success, courseName } ─┘
   │
   └── jsPDF: generate invoice.pdf → download
```

---

## 6. Live Session Architecture (Stream Video)

```
Faculty ──► POST /api/live/sessions (create session record)
Faculty ──► POST /api/live/token (generate Stream user token)
Faculty ──► Stream SDK: call.goLive() 

Student ──► GET /api/live/sessions (fetch session list)
Student ──► POST /api/live/token (generate Stream user token)
Student ──► Stream SDK: call.join() → Stream CDN (WebRTC)
```

> [!NOTE]
> **Needs Verification**: Stream token expiry strategy and refresh mechanism not found in source code.

---

## 7. Timetable Architecture (Dual-DB Pattern)

> [!IMPORTANT]
> The timetable system uses a **unique dual-access pattern**: Next.js Server Actions connect **directly to MongoDB** (bypassing the Express API server entirely), while all other modules use the REST API.

```
Frontend Next.js Server Actions (timetable.ts)
    │
    ├── connectDB()  ─────────────────────────────────► MongoDB Atlas
    ├── TimetableSession.find()                         (shared DB)
    ├── TimetableSession.findOneAndUpdate() [upsert]
    └── User.find({ role: 'faculty' })

Admin timetable page → upsertSlotAction() → TimetableSession (upsert by facultyName+date+slotIndex)
Faculty timetable page → getWeeklyTimetable() / getFacultyTimetableByName()
Student timetable page → getStudentTimetable(class) → filter by studentClass

ClassSession (frontend model) ── Used by getFacultySessions() for legacy class acceptance flow
TimetableSession (frontend model) ── Used by admin slot manager grid
```

---

## 8. File Upload Architecture

Two separate upload handlers exist:

| Handler | Route | Purpose |
|---|---|---|
| `materialRoutes.js` (multer) | `POST /api/materials` | Course material PDFs and images |
| `uploadRoutes.js` (multer) | `POST /api/v1/upload` | Doubt message image attachments |

Files are stored on the Express server disk at `/uploads/` and served via `app.use('/uploads', express.static('uploads'))`.

> [!WARNING]
> **Needs Verification**: In production (Vercel/cloud), ephemeral filesystem means `/uploads` will not persist. A cloud storage solution (S3, Cloudinary) would be needed.

---

## 9. Email Notification Architecture

Nodemailer (Gmail SMTP) sends automated emails for two events:

| Trigger | Recipient | Content |
|---|---|---|
| First student login | Student email | USN confirmation with their unique University Seat Number |
| Admin creates faculty | Faculty email | Welcome email with userId and default password |
