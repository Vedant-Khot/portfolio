# Sequence Diagrams — PPES Platform

Sequence diagrams for the primary user-facing workflows derived from actual source code in `frontend/`, `backend/`, and `middleware/`.

---

## 1. Student Authentication Flow

Source: `frontend/app/actions/auth.ts`, `backend/server.js` `/api/auth/login`, `frontend/middleware.ts`

```mermaid
sequenceDiagram
    actor Student
    participant Browser
    participant NextJS as Next.js Server
    participant Express as Express API (5000)
    participant MongoDB

    Student->>Browser: Enter email/USN + password
    Browser->>NextJS: loginAction(formData, "student")
    NextJS->>Express: POST /api/auth/login {email, password, role:"student"}
    Express->>MongoDB: User.findOne({email OR userId OR usn, role:"student"})
    MongoDB-->>Express: User document
    Express->>Express: bcrypt.compare(password, user.password)

    alt Invalid credentials
        Express-->>NextJS: 401 {error:"Invalid credentials"}
        NextJS-->>Browser: {success:false, error}
        Browser-->>Student: Show error toast
    else Valid credentials
        alt First login (student, isEmailSent=false)
            Express->>Express: sendUSNMail(email, name, usn)
            Express->>Express: Set user.isEmailSent = true and save User
        end
        Express-->>NextJS: 200 {user:{id,name,role,usn}}
        NextJS->>NextJS: sign JWT {userId, role, name} (24h)
        NextJS->>Browser: Set cookie "token" (JWT)
        NextJS->>Browser: Set cookie "user-data" (JSON)
        Browser-->>Student: Redirect to /student dashboard
    end
```

---

## 2. Route Protection (Middleware)

Source: `frontend/middleware.ts`

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Middleware as Next.js middleware.ts
    participant Dashboard

    User->>Browser: Navigate to /student/tests
    Browser->>Middleware: Request GET /student/tests
    Middleware->>Middleware: Read "token" cookie

    alt No token
        Middleware-->>Browser: Redirect 302 → /login/student
    else Token exists
        Middleware->>Middleware: jwtVerify(token, JWT_SECRET)
        alt Invalid / expired token
            Middleware-->>Browser: Redirect → "/" + delete token cookie
        else Valid token
            Middleware->>Middleware: Extract userRole from payload
            alt role != "student" (e.g. "admin")
                Middleware-->>Browser: Redirect → /student (wrong portal)
            else Correct role
                Middleware-->>Dashboard: next() — serve the page
                Dashboard-->>Browser: 200 Page HTML
            end
        end
    end
```

---

## 3. Student Takes a Test

Source: `frontend/app/student/tests/page.tsx`, `frontend/app/student/tests/[id]/page.tsx`, `backend/routes/testRoutes.js`, `backend/controllers/testController.js`

```mermaid
sequenceDiagram
    actor Student
    participant Browser
    participant Express as Express API (5000)
    participant MongoDB

    Student->>Browser: Navigate to /student/tests
    Browser->>Express: GET /api/tests {Authorization: Bearer JWT}
    Express->>MongoDB: Test.find().select('-questions.correctAnswer')
    MongoDB-->>Express: Test[] (no correct answers)
    Browser->>Express: GET /api/tests/attempts/me {Authorization: Bearer JWT}
    Express->>MongoDB: TestAttempt.find({studentId}).populate('testId')
    MongoDB-->>Express: TestAttempt[]
    Express-->>Browser: Tests + Attempts
    Browser-->>Student: Shows available tests + completed scores

    Student->>Browser: Click "Start Test" on a test
    Browser->>Express: GET /api/tests/:id {Authorization: Bearer JWT}
    Express->>MongoDB: Test.findById(id) [correctAnswers stripped]
    MongoDB-->>Express: Test with questions
    Express-->>Browser: Test document
    Browser-->>Student: Render question-by-question UI with timer

    Note over Browser: Timer saved per test in localStorage

    Student->>Browser: Answer all questions → Click "Submit Assessment"
    Browser->>Express: POST /api/tests/:id/attempt {answers:[{questionId, value}]}
    Express->>Express: Grade MCQ and MULTIPLE_SELECT automatically
    Express->>Express: Flag DESCRIPTIVE/CODING as pending_review
    Express->>MongoDB: TestAttempt.create({testId, studentId, score, maxScore, status})
    MongoDB-->>Express: Saved attempt
    Express-->>Browser: {score, maxScore, status, postTestMessage}
    Browser->>Browser: localStorage.removeItem test_timer
    Browser-->>Student: Toast success + Redirect to /student
```

---

## 4. Razorpay Course Purchase

Source: `frontend/components/RazorpayCheckoutButton.tsx`, `backend/routes/paymentRoutes.js`

```mermaid
sequenceDiagram
    actor Student
    participant Browser
    participant RazorpaySDK as Razorpay SDK (checkout.js)
    participant Express as Express API (5000)
    participant RazorpayAPI as Razorpay API
    participant MongoDB

    Student->>Browser: Click "Pay ₹X" on course page
    Browser->>Express: POST /api/v1/payment/create-order {amount, currency:"INR"}
    Express->>RazorpayAPI: razorpay.orders.create({amount, receipt})
    RazorpayAPI-->>Express: {order_id, amount, currency}
    Express-->>Browser: {order_id, amount, currency}
    Browser->>Browser: Load checkout.js (CDN)
    Browser->>RazorpaySDK: new Razorpay(options).open()
    Student->>RazorpaySDK: Complete payment (UPI/Card/etc)
    RazorpaySDK-->>Browser: handler({razorpay_payment_id, razorpay_order_id, razorpay_signature})

    Browser->>Express: POST /api/v1/payment/verify {payment_id, order_id, signature, courseId, amount} + JWT
    Express->>Express: authMiddleware (verify JWT → req.user.id)
    Express->>Express: HMAC-SHA256 verify signature
    alt Invalid signature
        Express-->>Browser: 400 {error:"Invalid payment signature"}
    else Valid signature
        Express->>MongoDB: Payment.create({studentId, courseId, amount, status:"success"})
        Express->>MongoDB: User.findOneAndUpdate($addToSet unlockedCourses: courseId)
        Express->>MongoDB: Course.findById(courseId).select('course_name')
        MongoDB-->>Express: courseName
        Express-->>Browser: {success:true, courseName}
        Browser->>Browser: generateInvoice() → download PDF
        Browser-->>Student: Toast + Redirect /student after 3s
    end
```

---

## 5. Doubt Creation and Teacher-Student Chat

Source: `backend/controllers/doubtController.js`, `backend/controllers/messageController.js`, `frontend/lib/api.ts`

```mermaid
sequenceDiagram
    actor Student
    actor Faculty
    participant Browser
    participant Express as Express API (5000)
    participant MongoDB

    Student->>Browser: Open "Ask Doubt" form
    Browser->>Express: POST /api/v1/doubts {title, subject_id, initial_message, teacher_id} + JWT
    Express->>Express: authMiddleware → req.user (role=student)
    Express->>Express: Validate role === "student"
    Express->>MongoDB: Doubt.create({title, subject_id, student_id, assigned_teacher_id, status:"open"})
    Express->>MongoDB: Message.create({doubt_id, sender_id, text, image_url})
    MongoDB-->>Express: Saved Doubt + Message
    Express-->>Browser: {doubt, initial_message}

    Faculty->>Browser: Open Doubts dashboard
    Browser->>Express: GET /api/v1/doubts + JWT
    Express->>Express: authMiddleware → req.user (role=faculty)
    Express->>MongoDB: Doubt.find({assigned_teacher_id: req.user.id})
    Express->>MongoDB: User.find (batch student details)
    Express->>MongoDB: Message.countDocuments (unread count per doubt)
    MongoDB-->>Express: Enriched doubts[]
    Express-->>Browser: {data: enrichedDoubts[]}

    Faculty->>Browser: Open a specific doubt thread
    Browser->>Express: GET /api/v1/doubts/:id + JWT
    Express->>MongoDB: Doubt.findById(id) + access control check
    Express->>MongoDB: Message.find({doubt_id}).sort(created_at: 1)
    Express->>MongoDB: Message.updateMany (mark others' messages as read)
    Express-->>Browser: {doubt, messages[]}

    Faculty->>Browser: Type and send reply
    Browser->>Express: POST /api/v1/messages {doubt_id, text} + JWT
    Express->>Express: Verify sender is student OR assigned teacher of this doubt
    Express->>MongoDB: Message.create({doubt_id, sender_id, text})
    Express->>MongoDB: Update doubt.updated_at and save Doubt
    Express-->>Browser: {message: savedMessage}
```

---

## 6. Admin Creates Timetable Slot

Source: `frontend/app/dashboard/admin/timetable/page.tsx`, `frontend/app/actions/timetable.ts`

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant NextJS as Next.js Server Action
    participant MongoDB

    Admin->>Browser: Load /dashboard/admin/timetable
    Browser->>NextJS: getFacultyList() [server action]
    NextJS->>MongoDB: User.find({role:"faculty"}).select("name")
    MongoDB-->>NextJS: Faculty[]
    Browser->>NextJS: getWeeklyTimetable() [server action]
    NextJS->>MongoDB: TimetableSession.find({})
    MongoDB-->>NextJS: TimetableSession[]
    NextJS-->>Browser: Render timetable grid

    Admin->>Browser: Fill slot manager form (faculty, date, slot, class, subject)
    Browser->>NextJS: upsertSlotAction(formData) [server action]
    NextJS->>NextJS: normalizeDate(dateInput) → local midnight Date
    NextJS->>MongoDB: TimetableSession.findOneAndUpdate({facultyName, date, slotIndex}, data, upsert:true)
    MongoDB-->>NextJS: Updated session
    NextJS->>NextJS: revalidatePath("/dashboard/faculty")
    NextJS->>NextJS: revalidatePath("/dashboard/student/timetable")
    NextJS-->>Browser: {success: true}
    Browser-->>Admin: Show "✅ Updated!" message
```

---

## 7. Faculty Hosts a Live Session

Source: `backend/server.js` (live routes), `frontend/components/StreamVideoProvider.tsx`, `frontend/components/MeetingRoom.tsx`

```mermaid
sequenceDiagram
    actor Faculty
    actor Student
    participant FacultyBrowser
    participant StudentBrowser
    participant Express as Express API (5000)
    participant StreamAPI as Stream Video API

    Faculty->>FacultyBrowser: Create live session
    FacultyBrowser->>Express: POST /api/live/sessions {title, description, facultyId, meetingId, status:"live"}
    Express->>MongoDB: Session.create(...)
    MongoDB-->>Express: Session document
    FacultyBrowser->>Express: POST /api/live/token {userId}
    Express->>StreamAPI: streamClient.generateUserToken({user_id, validity_in_seconds: 3600})
    StreamAPI-->>Express: stream_token
    Express-->>FacultyBrowser: {token}
    FacultyBrowser->>StreamAPI: call.goLive() [WebRTC via Stream SDK]

    Student->>StudentBrowser: View live sessions
    StudentBrowser->>Express: GET /api/live/sessions
    Express->>MongoDB: Session.find().sort(createdAt: -1)
    MongoDB-->>Express: Session[]
    Express-->>StudentBrowser: Sessions list

    Student->>StudentBrowser: Click "Join Class"
    StudentBrowser->>Express: POST /api/live/token {userId}
    Express->>StreamAPI: generateUserToken(studentId)
    StreamAPI-->>Express: token
    StudentBrowser->>StreamAPI: call.join() [WebRTC]
    Note over FacultyBrowser,StudentBrowser: Real-time audio/video via Stream CDN

    Faculty->>FacultyBrowser: End session
    FacultyBrowser->>Express: PATCH /api/live/sessions/:meetingId/status {status:"ended"}
    Express->>MongoDB: Session.findOneAndUpdate({meetingId}, {status:"ended"})
    Express-->>FacultyBrowser: Updated session
```

---

## 8. Admin Creates a Faculty Member

Source: `backend/server.js` (`POST /api/admin/faculty`)

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant Express as Express API (5000)
    participant MongoDB
    participant Gmail as Gmail SMTP

    Admin->>Browser: Fill "Create Faculty" form
    Browser->>Express: POST /api/admin/faculty {name, email, userId, usn, password}
    Express->>MongoDB: User.findOne({email}) — check duplicate
    alt Email already exists
        MongoDB-->>Express: Existing user
        Express-->>Browser: 400 {error:"User already exists"}
    else New email
        Express->>Express: bcrypt.hash(password, 12)
        Express->>MongoDB: User.create({role:"faculty", hashedPassword, ...})
        MongoDB-->>Express: New faculty user
        Express->>Gmail: sendFacultyWelcomeMail(email, name, userId, password)
        Gmail-->>Express: Email sent
        Express-->>Browser: 201 {user: newFaculty}
        Browser-->>Admin: Success notification
    end
```
