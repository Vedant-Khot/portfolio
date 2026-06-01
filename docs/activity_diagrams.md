# Activity Diagrams — PPES Platform

Business logic flowcharts for complex multi-step operations. These diagrams capture decision points, branching logic, and process flows derived from controller and route handler code.

---

## 1. Login and Session Bootstrap

Source: `backend/server.js` (`POST /api/auth/login`), `frontend/app/actions/auth.ts`

```mermaid
flowchart TD
    A([Student/Faculty/Admin navigates to login]) --> B[Submit email + password + role]
    B --> C[POST /api/auth/login]
    C --> D{Find user by email\nOR userId OR usn}
    D -- Not Found --> E[Return 401 Invalid credentials]
    E --> Z([Show error toast])
    D -- Found --> F{Role match?}
    F -- No --> E
    F -- Yes --> G[bcrypt.compare password]
    G -- Mismatch --> E
    G -- Match --> H{Is Student\nAND isEmailSent=false?}
    H -- Yes --> I[Generate USN]
    I --> J[Send USN welcome email via Nodemailer]
    J --> K[user.isEmailSent = true → save]
    K --> L
    H -- No --> L[Return user: id, name, role, usn]
    L --> M[Next.js: sign JWT payload userId+role+name]
    M --> N[Set cookie: token httpOnly=false 24h]
    N --> O[Set cookie: user-data JSON 24h]
    O --> P{Check role}
    P -- student --> Q([Redirect to /student])
    P -- faculty --> R([Redirect to /faculty])
    P -- admin --> S([Redirect to /admin])
```

---

## 2. Test Auto-Grading Algorithm

Source: `backend/controllers/testController.js` (submitAttempt)

```mermaid
flowchart TD
    A([Student submits test answers]) --> B[POST /api/tests/:id/attempt]
    B --> C[Auth middleware: extract studentId from JWT]
    C --> D[Test.findById with questions+correctAnswer]
    D --> E{Student already\nattempted this test?}
    E -- Yes --> F[Return 409 Already attempted]
    E -- No --> G[Initialize: score=0, maxScore=0, status=completed]
    G --> H[For each question in test]
    H --> I{Question type?}

    I -- MCQ --> J[maxScore += question.points]
    J --> K{student answer\n=== correctAnswer?}
    K -- Yes --> L[score += question.points]
    K -- No --> M[score += 0]
    L --> N
    M --> N

    I -- MULTIPLE_SELECT --> O[maxScore += question.points]
    O --> P{Arrays match\nexactly?}
    P -- Yes --> Q[score += question.points]
    P -- No --> R[score += 0]
    Q --> N
    R --> N

    I -- DESCRIPTIVE --> S[maxScore += question.points]
    S --> T[score += 0 pending review]
    T --> U[status = pending_review]
    U --> N

    I -- CODING --> V[maxScore += question.points]
    V --> W[score += 0 pending review]
    W --> U

    N{More questions?}
    N -- Yes --> H
    N -- No --> X[TestAttempt.create - score, maxScore, status, answers]
    X --> Y[Return score, maxScore, passingScore, postTestMessage]
    Y --> Z([Student sees result])
```

---

## 3. Doubt Routing and Access Control

Source: `backend/controllers/doubtController.js`

```mermaid
flowchart TD
    A([Request to GET /api/v1/doubts]) --> B[authMiddleware: verify JWT]
    B --> C{req.user.role?}

    C -- student --> D[query: student_id = req.user.id]
    C -- faculty --> E[query: assigned_teacher_id = req.user.id]
    C -- admin --> F[query: {} empty - sees all]

    D --> G[Apply optional filters: subject_id, teacher_id]
    E --> G
    F --> G

    G --> H[Doubt.find + sort by updated_at DESC]
    H --> I[Batch fetch student User documents]
    I --> J[For each doubt: count unread Messages from other party]
    J --> K[Enrich with student_name, student_grade, has_unread]
    K --> L([Return enrichedDoubts])

    M([Request GET /api/v1/doubts/:id]) --> N[authMiddleware]
    N --> O[Doubt.findById]
    O --> P{Doubt exists?}
    P -- No --> Q[404 Not Found]
    P -- Yes --> R{role = student?}
    R -- Yes --> S{doubt.student_id\n= req.user.id?}
    S -- No --> T[403 Unauthorized]
    S -- Yes --> U[Allow access]
    R -- No --> V{role = faculty?}
    V -- Yes --> W{doubt.assigned_teacher_id\n= req.user.id?}
    W -- No --> T
    W -- Yes --> U
    V -- No --> U

    U --> X[Message.find + sort created_at ASC]
    X --> Y[Message.updateMany - mark others' messages as is_read=true]
    Y --> Z([Return doubt + messages])
```

---

## 4. Material Upload and Linking

Source: `backend/routes/materialRoutes.js`

```mermaid
flowchart TD
    A([Admin uploads material file]) --> B[POST /api/materials multipart/form-data]
    B --> C[multer: validate file]
    C --> D{File present?}
    D -- No --> E[400 No file uploaded]
    D -- Yes --> F[Save to uploads/ with unique filename]
    F --> G[url = /uploads/uniquefilename.ext]
    G --> H[Material.create - title, subjectId, url, type]
    H --> I[Subject.findByIdAndUpdate - push material._id]
    I --> J[201 return Material document]

    K([Admin deletes material]) --> L[DELETE /api/materials/:id]
    L --> M[Material.findByIdAndDelete]
    M --> N{Material found?}
    N -- No --> O[404 Not Found]
    N -- Yes --> P[Subject.findByIdAndUpdate - pull material._id]
    P --> Q[path.join backend/uploads/filename]
    Q --> R{File on disk?}
    R -- Yes --> S[fs.unlinkSync - delete file]
    R -- No --> T[Skip disk delete]
    S --> U[200 Material resource deleted]
    T --> U
```

---

## 5. Timetable Slot Upsert Logic

Source: `frontend/app/actions/timetable.ts` (`upsertSlotAction`)

```mermaid
flowchart TD
    A([Admin submits slot form]) --> B[upsertSlotAction server action]
    B --> C[Extract: facultyName, dateInput, slotIndex, duration, studentClass, subject]
    C --> D[normalizeDate: parse YYYY-MM-DD → local midnight Date object]
    D --> E[Compute startTime from slotIndex lookup array]
    E --> F[Build data object: facultyName, facultyId, date, slotIndex, duration, studentClass, subject, startTime]
    F --> G[TimetableSession.findOneAndUpdate\nquery: facultyName + date + slotIndex\nupdate: data\nupsert: true]
    G --> H{Slot existed?}
    H -- Yes --> I[Update existing slot]
    H -- No --> J[Insert new slot]
    I --> K[revalidatePath /dashboard/faculty]
    J --> K
    K --> L[revalidatePath /dashboard/student/timetable]
    L --> M([Return success:true])

    N([Faculty adds topic]) --> O[updateTopicAction server action]
    O --> P[TimetableSession.findByIdAndUpdate - topic field]
    P --> K
```

---

## 6. Course CRUD with Subject Cascade

Source: `backend/routes/courseRoutes.js`, `backend/routes/subjectRoutes.js`

```mermaid
flowchart TD
    A([Admin creates course]) --> B[POST /api/courses]
    B --> C[Course.create - course_name, course_id, price, isPublished]
    C --> D[201 Course document]

    E([Admin adds subject to course]) --> F[POST /api/subjects]
    F --> G{teacherId provided?}
    G -- Yes --> H[User.findById teacherId - get userId string]
    H --> I[facultyIds: push userId string]
    G -- No --> J[facultyIds: empty]
    I --> K[Subject.create - subject_name, subject_id, teacherId, facultyIds, courseId]
    J --> K
    K --> L[Course.findByIdAndUpdate - push subject._id]
    L --> M[201 Subject document]

    N([Admin deletes course]) --> O[DELETE /api/courses/:id]
    O --> P[Course.findByIdAndDelete]
    P --> Q{Course found?}
    Q -- No --> R[404]
    Q -- Yes --> S[Subject.deleteMany - courseId = course._id]
    S --> T[200 Course and subjects deleted]

    U([Admin deletes subject]) --> V[DELETE /api/subjects/:id]
    V --> W[Subject.findByIdAndDelete]
    W --> X{Subject found?}
    X -- No --> R
    X -- Yes --> Y[Course.findByIdAndUpdate - pull subject._id]
    Y --> Z[200 Subject deleted]
```

---

## 7. Live Session Token Generation

Source: `backend/server.js` (`POST /api/live/token`, `POST /api/live/sessions`)

```mermaid
flowchart TD
    A([Faculty/Student requests Stream token]) --> B[POST /api/live/token]
    B --> C{body.userId provided?}
    C -- No --> D[400 userId is required]
    C -- Yes --> E[Initialize StreamClient with API_KEY + API_SECRET]
    E --> F{streamClient initialized?}
    F -- No --> G[500 Stream client not initialized]
    F -- Yes --> H[streamClient.generateUserToken - userId, validity=3600s]
    H --> I[200 return token]

    J([Faculty creates session]) --> K[POST /api/live/sessions]
    K --> L[Check for existing session with same meetingId]
    L --> M{Already exists?}
    M -- Yes --> N[Return existing session]
    M -- No --> O[Session.create - title, facultyId, meetingId, status]
    O --> P[201 New session]

    Q([Status update]) --> R[PATCH /api/live/sessions/:meetingId/status]
    R --> S[Session.findOneAndUpdate - meetingId → status]
    S --> T{Found?}
    T -- No --> U[404]
    T -- Yes --> V[200 Updated session]
```

---

## 8. Admin Payment Management

Source: `backend/routes/paymentRoutes.js` (`GET /api/v1/payments`)

```mermaid
flowchart TD
    A([Admin views payments page]) --> B[GET /api/v1/payments + JWT]
    B --> C[authMiddleware: verify JWT → req.user]
    C --> D{req.user.role = admin?}
    D -- No --> E[403 Admin access required]
    D -- Yes --> F[Payment.find.populate courseId - course_name, course_id]
    F --> G[Sort by createdAt DESC]
    G --> H[User.find - all users - userId name usn email]
    H --> I[Build userMap: userId → User object]
    I --> J[payments.map: merge studentDetails from userMap]
    J --> K[200 return populatedPayments]
    K --> L([Admin sees table: student name, USN, course, amount, date])
```
