# Class Diagrams — PPES Platform

All classes and their relationships derived from Mongoose schema definitions in `backend/models/` and `frontend/lib/models/`.

---

## 1. Core Domain Models (Backend — Express/MongoDB)

### 1.1 Complete Class Diagram

```mermaid
classDiagram
    class User {
        +String userId
        +String usn
        +String name
        +String email
        +String role ["admin"|"faculty"|"student"|"ADMIN"|"TEACHER"|"STUDENT"]
        +String password
        +String image
        +String status
        +String grade
        +Boolean isEmailSent
        +Date createdAt
        +ObjectId[] unlockedCourses
    }

    class Course {
        +String course_name
        +String course_id [unique]
        +Date course_start_date
        +String course_description
        +String title [compat alias]
        +String description [compat alias]
        +Number price
        +Boolean isPublished
        +ObjectId[] subjects
        +Date createdAt
        +Date updatedAt
    }

    class Subject {
        +String subject_name
        +String subject_id [unique]
        +String name [compat alias]
        +String code [compat alias]
        +String description
        +String[] facultyIds
        +ObjectId teacherId
        +ObjectId courseId
        +ObjectId[] materials
        +Date createdAt
        +Date updatedAt
    }

    class Material {
        +String title
        +String url
        +String type ["PDF"|"IMAGE"]
        +ObjectId subjectId
        +Date createdAt
        +Date updatedAt
    }

    class Test {
        +String title
        +String description
        +Number durationMinutes
        +Number passingScore
        +String postTestMessage
        +Boolean isManualRelease
        +ObjectId createdBy
        +ObjectId courseId
        +Question[] questions
        +Date createdAt
        +Date updatedAt
    }

    class Question {
        +String type ["MCQ"|"MULTIPLE_SELECT"|"DESCRIPTIVE"|"CODING"]
        +String text
        +Number points
        +String[] options
        +Mixed correctAnswer
    }

    class TestAttempt {
        +ObjectId testId
        +ObjectId studentId
        +Answer[] answers
        +Number score
        +Number maxScore
        +String status ["completed"|"pending_review"]
        +Date createdAt
        +Date updatedAt
    }

    class Answer {
        +ObjectId questionId
        +Mixed value
    }

    class Doubt {
        +String title
        +String subject_id
        +String student_id
        +String assigned_teacher_id
        +String status ["open"|"resolved"|"closed"]
        +Boolean is_teacher_validated
        +Date created_at
        +Date updated_at
    }

    class Message {
        +ObjectId doubt_id
        +String sender_id
        +String text
        +String image_url
        +Boolean is_read
        +Date created_at
        +Date updated_at
    }

    class Payment {
        +String studentId [indexed]
        +ObjectId courseId
        +Number amount
        +String razorpay_order_id
        +String razorpay_payment_id [unique]
        +String status ["success"|"failed"|"pending"]
        +Date createdAt
    }

    class Event {
        +String type ["Workshop"|"Special Class"]
        +String title
        +String topic
        +String speaker
        +String mentor
        +String mode ["Online"|"Offline"]
        +String platformOrLocation
        +String date
        +String time
        +String duration
        +String price
        +String limitSeats
        +String category
        +String description
        +Date createdAt
        +Date updatedAt
    }

    class Session {
        +String title
        +String description
        +String facultyId
        +String meetingId [unique]
        +Date startTime
        +String status ["scheduled"|"live"|"ended"]
        +Date createdAt
    }

    class Attendance {
        +String userId
        +String userName
        +String classId
        +String role
        +Date entryTime
        +Date exitTime
    }

    %% Relationships
    User "1" --> "many" Course : unlockedCourses (enrolled in)
    Course "1" --> "many" Subject : contains
    Subject "1" --> "many" Material : has
    Subject "1" --> "1" User : teacherId (assigned faculty)
    Test "1" --> "many" Question : contains
    Test --> "1" Course : belongs to (optional)
    Test --> "1" User : createdBy (admin)
    TestAttempt --> "1" Test : references
    TestAttempt --> "1" User : studentId (references)
    TestAttempt "1" --> "many" Answer : contains
    Doubt --> "1" User : student_id
    Doubt --> "1" User : assigned_teacher_id (optional)
    Message --> "1" Doubt : doubt_id
    Payment --> "1" User : studentId
    Payment --> "1" Course : courseId
    Attendance --> "1" User : userId (string ref)
    Session --> "1" User : facultyId (string ref)
```

---

## 2. Frontend Mongoose Models (Next.js Server Actions)

> These models exist in `frontend/lib/models/` and are accessed **directly from Next.js server actions** (bypassing the Express backend).

```mermaid
classDiagram
    class TimetableSession {
        +String facultyName
        +String facultyId
        +Date date
        +Number slotIndex
        +Number duration [default: 1]
        +String studentClass ["09"|"10"]
        +String subject
        +String topic [default: ""]
        +String startTime
        +String liveLink [default: ""]
    }

    class ClassSession {
        +String studentClass
        +String facultyName
        +String subject
        +String topic
        +Date date
        +String startTime
        +String endTime [optional]
        +String facultyId [optional]
        +String scheduledMessage [default: ""]
        +String status [default: "pending"]
    }

    class UserFrontend {
        +String userId
        +String name
        +String email
        +String password
        +String role ["admin"|"faculty"|"student"]
        +String usn [unique, sparse]
        +Boolean isVerified [default: false]
        +Date createdAt
    }

    note for TimetableSession "Unique constraint: facultyName + date + slotIndex\nUsed by admin slot manager grid"
    note for ClassSession "Legacy class acceptance model\nUsed by getFacultySessions()"
    note for UserFrontend "Mirror of backend User model\nUsed only for timetable faculty lookups"
```

---

## 3. Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| `User` → `Course` | Many-to-Many (via `unlockedCourses[]`) | A student can be enrolled in multiple courses |
| `Course` → `Subject` | One-to-Many | A course contains multiple subjects |
| `Subject` → `Material` | One-to-Many | A subject has multiple material files |
| `Subject` → `User` | Many-to-One | A subject is taught by one faculty member |
| `Test` → `Course` | Many-to-One (optional) | Tests can be linked to a course |
| `TestAttempt` → `Test` | Many-to-One | Multiple students attempt the same test |
| `TestAttempt` → `User` | Many-to-One | A student may have one attempt per test |
| `Doubt` → `User (student)` | Many-to-One | A student creates doubts |
| `Doubt` → `User (faculty)` | Many-to-One (optional) | A faculty member is assigned to a doubt |
| `Message` → `Doubt` | Many-to-One | A doubt has a thread of messages |
| `Payment` → `User` | Many-to-One | A payment belongs to one student |
| `Payment` → `Course` | Many-to-One | A payment unlocks one course |
| `Attendance` → `Session` | Many-to-One | Multiple attendees per session |

---

## 4. Compatibility Field Note

> [!NOTE]
> The `Course` and `Subject` models contain **duplicate compatibility fields** (`title`/`course_name`, `description`/`course_description`, `name`/`subject_name`, `code`/`subject_id`). These are intentional aliases maintained for frontend component compatibility and were added during a schema migration. The primary fields are the `course_*` and `subject_*` prefixed variants.
