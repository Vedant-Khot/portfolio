# PPES — UML Documentation

**Prarambha Path Evening School (PPES)** is a full-stack web application for managing an evening school's academic operations. It is built on **Next.js 14 (App Router)** for the frontend and **Express.js + MongoDB** for the backend API server.

---

## Project Architecture at a Glance

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS v4, shadcn/ui |
| Backend API | Express.js, Node.js |
| Database | MongoDB Atlas via Mongoose |
| Authentication | JWT (signed server-side via `jsonwebtoken`, verified on both frontend middleware and backend middleware) |
| Payments | Razorpay (order creation → HMAC verification → enrollment) |
| Live Video | Stream Video SDK (`@stream-io/node-sdk`, `@stream-io/video-react-sdk`) |
| Email | Nodemailer via Gmail SMTP |
| File Uploads | Multer (disk storage → `/uploads`) |
| Analytics | Vercel Analytics |

---

## Document Index

| File | Description |
|---|---|
| [README.md](./README.md) | This file — project overview and document index |
| [architecture_notes.md](./architecture_notes.md) | System architecture, deployment topology, data flow patterns |
| [class_diagrams.md](./class_diagrams.md) | Database models and their relationships |
| [sequence_diagrams.md](./sequence_diagrams.md) | Actor-to-system interaction flows for key features |
| [state_diagrams.md](./state_diagrams.md) | Lifecycle state machines for core entities |
| [activity_diagrams.md](./activity_diagrams.md) | Business logic flowcharts for complex operations |

---

## Roles in the System

| Role | Portal Entry | Access Scope |
|---|---|---|
| `admin` | `/login/admin_login` → `/admin` | Full system access: users, courses, events, tests, payments, faculty, timetable |
| `faculty` | `/login/faculty` → `/faculty` | Own timetable, doubts assigned to them, live session hosting |
| `student` | `/login/student` → `/student` | Own doubts, enrolled courses, tests, timetable, events, live sessions |

---

## Key Conventions

- All protected routes check a JWT stored in the **`token`** cookie; verified in `frontend/middleware.ts` using `jose` and in `backend/middleware/auth.js` using `jsonwebtoken`.
- The `user-data` cookie (non-httpOnly) stores serialized user identity for client-side reads.
- The frontend Next.js server actions at `frontend/app/actions/timetable.ts` connect **directly to MongoDB** (bypassing the Express backend) for timetable data.
- The Express backend handles all other data operations at `http://localhost:5000`.

---

## Assumptions & Needs Verification

> [!NOTE]
> The following items could not be fully confirmed from source code alone and are marked accordingly throughout the documents.

- **Needs Verification**: Whether Stream Video session tokens expire and how re-authentication is handled.
- **Needs Verification**: Whether `ClassSession` (frontend model) and `Session` (backend model) refer to different data stores for different purposes.
- **Needs Verification**: The exact Razorpay webhook configuration (if any) for server-side payment event listening.
- **Needs Verification**: Production deployment target and CDN strategy for uploaded static files.
