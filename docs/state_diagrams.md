# State Diagrams — PPES Platform

Lifecycle state machines for the core entities in the system, derived from Mongoose schema `enum` fields, controller logic, and route handlers.

---

## 1. Doubt Lifecycle

Source: `backend/models/Doubt.js`, `backend/controllers/doubtController.js`

```mermaid
stateDiagram-v2
    [*] --> open : Student creates doubt\n(POST /api/v1/doubts)

    open --> resolved : Student or assigned faculty\n(PATCH /:id/status {status:"resolved"})
    open --> closed : Student or assigned faculty\n(PATCH /:id/status {status:"closed"})

    resolved --> open : Re-opened\n(PATCH /:id/status {status:"open"})
    resolved --> closed : Finalized\n(PATCH /:id/status {status:"closed"})

    closed --> [*] : Terminal state

    note right of open
        Messages can be sent in this state.
        Assigned teacher can reply.
        Unread count tracked per user.
    end note

    note right of resolved
        is_teacher_validated flag may be toggled.
        Student can still view messages.
    end note
```

---

## 2. Test Attempt Status

Source: `backend/models/TestAttempt.js`, `backend/controllers/testController.js`

```mermaid
stateDiagram-v2
    [*] --> attempted : Student submits test\n(POST /api/tests/:id/attempt)

    attempted --> completed : All questions are\nMCQ/MULTIPLE_SELECT\n(auto-graded instantly)

    attempted --> pending_review : At least one question\nis DESCRIPTIVE or CODING\n(requires manual review)

    pending_review --> completed : Admin/Faculty reviews\nand assigns scores

    completed --> [*] : Final state — score visible to student

    note right of pending_review
        Needs Verification:
        Manual review endpoint not found
        in source code. May be handled
        via admin dashboard (future feature).
    end note
```

---

## 3. Payment Status

Source: `backend/models/Payment.js`, `backend/routes/paymentRoutes.js`

```mermaid
stateDiagram-v2
    [*] --> pending : Payment record created before\nRazorpay confirmation

    pending --> success : HMAC signature verified\n(POST /api/v1/payment/verify)

    pending --> failed : Payment failed in Razorpay modal\nor HMAC mismatch detected

    success --> [*] : Student enrolled in course;\ninvoice PDF generated

    failed --> [*] : No enrollment; student may retry

    note right of success
        On success:
        Payment.create() is called
        User.unlockedCourses.push(courseId)
        Invoice generated client-side
    end note

    note left of pending
        Default status in schema is "success"
        because Payment.create() is only
        called after verification succeeds.
        "pending" / "failed" are available
        for future manual record use.
    end note
```

---

## 4. Live Session Lifecycle

Source: `backend/models/Session.js`, `backend/server.js` (live routes)

```mermaid
stateDiagram-v2
    [*] --> scheduled : Faculty creates session\n(POST /api/live/sessions)

    scheduled --> live : Faculty starts broadcast\n(PATCH /api/live/sessions/:meetingId/status)

    live --> ended : Faculty ends session\n(PATCH /api/live/sessions/:meetingId/status)

    ended --> [*] : Session archived;\nstudents can no longer join

    note right of scheduled
        Meeting ID is pre-assigned.
        Stream token already issued.
        Students can see session in list.
    end note

    note right of live
        Students can join via Stream SDK.
        Attendance tracked (Attendance model).
        Whiteboard, polls, resources available.
    end note
```

---

## 5. User Account Lifecycle

Source: `backend/models/User.js`, `backend/server.js` (auth + admin faculty routes)

```mermaid
stateDiagram-v2
    [*] --> created : Admin creates user\n(POST /api/admin/faculty)\nOR Student self-registers (Needs Verification)

    created --> email_sent : First student login triggers\nUSN email via Gmail SMTP\n(isEmailSent: false → true)

    created --> active : Faculty gets welcome email\non account creation

    email_sent --> active : Student logs in with USN\n(normal usage begins)

    active --> suspended : Admin sets status="suspended"\n(Needs Verification — no endpoint found)

    suspended --> active : Admin re-activates user

    active --> [*] : Admin deletes user\n(DELETE /api/admin/faculty/:id)

    note right of created
        Initial status: "active"
        isVerified: false
        isEmailSent: false (student)
    end note

    note right of email_sent
        Only applies to student role.
        USN is auto-generated and emailed
        on first successful login.
    end note
```

---

## 6. Course Enrollment State (Per Student)

Source: `backend/models/User.js (unlockedCourses[])`, `backend/routes/courseRoutes.js`, `backend/routes/paymentRoutes.js`

```mermaid
stateDiagram-v2
    [*] --> locked : Course exists in DB\nbut not in student's unlockedCourses[]

    locked --> unlocked : Payment verified\n(POST /api/v1/payment/verify)\nOR Admin grants access\n(POST /api/courses/purchase)

    unlocked --> [*] : Student can view all\nsubjects, materials, tests

    note right of locked
        Student can see course listing
        and pricing but cannot access
        subject content or materials.
    end note

    note right of unlocked
        Stored as ObjectId in
        User.unlockedCourses[]
        Checked via User.find({unlockedCourses: courseId})
    end note
```

---

## 7. Timetable Slot Lifecycle

Source: `frontend/app/actions/timetable.ts`, `frontend/lib/models/TimetableSession.ts`

```mermaid
stateDiagram-v2
    [*] --> empty : Grid slot has no session

    empty --> assigned : Admin fills slot\n(upsertSlotAction with facultyName+date+slotIndex)

    assigned --> updated : Admin re-fills same slot\n(upsert overwrites existing)

    assigned --> topic_added : Faculty adds topic\n(updateTopicAction)

    topic_added --> updated : Admin or faculty updates

    updated --> [*] : Slot visible to students\n(getStudentTimetable) and faculty\n(getFacultyTimetableByName)

    note right of assigned
        Unique key: facultyName + date + slotIndex
        Upsert prevents duplicate slots.
        revalidatePath clears Next.js cache.
    end note
```
