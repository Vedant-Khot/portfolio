# Doubts & Payment System - Testing Guide

**Date**: May 7, 2026  
**Status**: Ready for Testing

---

## Test User Credentials

The backend is pre-seeded with these test users. Use these **actual user IDs** for testing:

### Students (Can create doubts)
| User ID | USN | Name | Email | Password |
|---------|-----|------|-------|----------|
| `student_01` | `1PP23CS045` | Aryan Verma | aryan@student.edu | `password123` |
| `student_02` | `1PP23IS012` | Aditi Sharma | aditi@student.edu | `password123` |

### Teachers (Can view & respond to doubts)
| User ID | USN | Name | Email | Password |
|---------|-----|------|-------|----------|
| `faculty_01` | `FAC-102` | Dr. Smith | smith@ppes.edu | `password123` |

### Admins
| User ID | USN | Name | Email | Password |
|---------|-----|------|-------|----------|
| `admin_01` | `ADMIN-001` | Parth Karpe | admin@ppes.edu | `password123` |

---

## Testing via cURL (Backend API)

### 1. Create a Doubt (Student)

```bash
curl -X POST http://localhost:5000/api/v1/doubts \
  -H "Content-Type: application/json" \
  -H "x-user-id: student_01" \
  -H "x-user-role: student" \
  -d '{
    "title": "How to solve differential equations?",
    "subject_id": "math-101",
    "initial_message": {
      "text": "I am struggling with second-order linear differential equations.",
      "image_url": null
    },
    "teacher_id": "faculty_01"
  }'
```

**Expected Response (201)**:
```json
{
  "success": true,
  "doubt": {
    "_id": "ObjectId",
    "title": "How to solve differential equations?",
    "subject_id": "math-101",
    "student_id": "student_01",
    "assigned_teacher_id": "faculty_01",
    "status": "open",
    "is_teacher_validated": false,
    "created_at": "2026-05-07T12:00:00Z",
    "updated_at": "2026-05-07T12:00:00Z"
  },
  "initial_message": {
    "_id": "ObjectId",
    "doubt_id": "ObjectId",
    "sender_id": "student_01",
    "text": "I am struggling with second-order linear differential equations.",
    "image_url": null,
    "created_at": "2026-05-07T12:00:00Z"
  }
}
```

### 2. Get All Doubts (as Student - see only own)

```bash
curl -X GET http://localhost:5000/api/v1/doubts \
  -H "x-user-id: student_01" \
  -H "x-user-role: student"
```

### 3. Get Doubts Assigned to Teacher

```bash
curl -X GET http://localhost:5000/api/v1/doubts \
  -H "x-user-id: faculty_01" \
  -H "x-user-role: teacher"
```

### 4. Get Doubt Details (includes all messages)

Replace `DOUBT_ID` with actual MongoDB ObjectId from create response:

```bash
curl -X GET http://localhost:5000/api/v1/doubts/DOUBT_ID \
  -H "x-user-id: student_01" \
  -H "x-user-role: student"
```

**Expected Response**:
```json
{
  "success": true,
  "doubt": { ... },
  "messages": [
    {
      "_id": "ObjectId",
      "doubt_id": "DOUBT_ID",
      "sender_id": "student_01",
      "text": "I am struggling...",
      "image_url": null,
      "created_at": "2026-05-07T12:00:00Z"
    }
  ]
}
```

### 5. Add Message to Doubt (Teacher reply)

```bash
curl -X POST http://localhost:5000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-user-id: faculty_01" \
  -H "x-user-role: teacher" \
  -d '{
    "doubt_id": "DOUBT_ID",
    "text": "Let me explain the method of undetermined coefficients...",
    "image_url": null
  }'
```

### 6. Update Doubt Status

```bash
curl -X PATCH http://localhost:5000/api/v1/doubts/DOUBT_ID/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: student_01" \
  -H "x-user-role: student" \
  -d '{
    "status": "resolved"
  }'
```

Valid statuses: `open`, `resolved`, `closed`

### 7. Upload Image

```bash
curl -X POST http://localhost:5000/api/v1/upload \
  -H "x-user-id: student_01" \
  -H "x-user-role: student" \
  -F "file=@/path/to/image.jpg"
```

**Expected Response**:
```json
{
  "success": true,
  "image_url": "/uploads/1715075431200-123456789.jpg"
}
```

---

## Testing via Frontend

### Setup Session Storage in Browser

1. **Open DevTools** (F12) → Console tab

2. **Set session for Student**:
   ```javascript
   sessionStorage.setItem('userId', 'student_01');
   sessionStorage.setItem('userRole', 'student');
   ```

   **OR set for Teacher**:
   ```javascript
   sessionStorage.setItem('userId', 'faculty_01');
   sessionStorage.setItem('userRole', 'teacher');
   ```

3. **Refresh page** and verify headers are sent correctly

### Test Doubts Pages

1. **List Doubts**:
   - Navigate to: `http://localhost:3000/doubts`
   - Should show doubts filtered by current user role and ID

2. **Create New Doubt** (as Student):
   - Navigate to: `http://localhost:3000/doubts/new`
   - Fill form:
     - Title: "How does cloud computing work?"
     - Subject: Select from dropdown
     - Teacher: (optional)
     - Initial Message: "I need clarity on cloud services"
     - Image: (optional - drag & drop or click to upload)
   - Click "Submit"
   - Should redirect to detail page with new doubt

3. **View Doubt Details**:
   - Click on doubt from list
   - Should show thread with all messages
   - See student's initial message
   - Can add reply messages
   - Can mark as resolved/closed

### Test Payment Flow

1. **Navigate to Test Payment Page**:
   - Go to: `http://localhost:3000/test-payment`

2. **Enter Amount**:
   - Input: `10` (INR)
   - Click "Pay with Razorpay"

3. **Modal Opens** with:
   - Merchant: "PPES Test Website"
   - Amount: 10 INR
   - Payment options visible

4. **Complete Payment** (Test Mode):
   - Use Razorpay test card: `4111111111111111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Click Pay

5. **Verify Payment**:
   - Success message should appear
   - Payment verified on backend

---

## Complete Workflow Test

### Scenario: Student Asks Doubt, Teacher Answers

**Step 1: Login as Student (in browser console)**
```javascript
sessionStorage.setItem('userId', 'student_01');
sessionStorage.setItem('userRole', 'student');
location.reload();
```

**Step 2: Student creates doubt**
- Navigate to: `/doubts/new`
- Fill form and submit
- Copy the doubt ID from URL

**Step 3: Login as Teacher**
```javascript
sessionStorage.setItem('userId', 'faculty_01');
sessionStorage.setItem('userRole', 'teacher');
location.reload();
```

**Step 4: Teacher views doubt**
- Navigate to: `/doubts`
- Should see assigned doubts
- Click on doubt from Step 2

**Step 5: Teacher adds message**
- In detail page, add reply message
- Can upload solution image

**Step 6: Student marks as resolved**
```javascript
sessionStorage.setItem('userId', 'student_01');
sessionStorage.setItem('userRole', 'student');
location.reload();
```
- Navigate to doubt detail
- Click "Mark as Resolved"
- Status updates to "resolved"

---

## Common Errors & Solutions

### Error: "Missing authentication headers: x-user-id and x-user-role"
**Fix**: Ensure session storage is set before API call:
```javascript
sessionStorage.setItem('userId', 'student_01');
sessionStorage.setItem('userRole', 'student');
```

### Error: "Only students can create doubts"
**Fix**: Change role to 'student':
```javascript
sessionStorage.setItem('userRole', 'student');
```

### Error: "Unauthorized access to doubt"
**Fix**: You're trying to access someone else's doubt. Use correct user ID for the role.

### Error: "Cannot GET /uploads/..."
**Fix**: Ensure backend is running and uploads directory exists at `backend/uploads/`

### Error: 404 Not Found on doubts pages
**Fix**: Ensure all 3 frontend pages are created:
- `frontend/app/doubts/page.tsx`
- `frontend/app/doubts/new/page.tsx`
- `frontend/app/doubts/[id]/page.tsx`

---

## Database Cleanup

If you want to reset doubts/messages, connect to MongoDB:

```javascript
// In MongoDB shell or Atlas UI
use my_database  // or your DB name
db.doubts.deleteMany({});
db.messages.deleteMany({});
```

---

## Postman Collection

Import this as Postman collection for quick testing:

```json
{
  "info": {
    "name": "PPES Doubts API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Doubt",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/doubts",
        "header": [
          {
            "key": "x-user-id",
            "value": "student_01"
          },
          {
            "key": "x-user-role",
            "value": "student"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Test Doubt\",\n  \"subject_id\": \"math-101\",\n  \"initial_message\": {\n    \"text\": \"Need help with this\"\n  }\n}"
        }
      }
    }
  ]
}
```

---

## Performance Notes

- **Real-time Updates**: Currently uses 5-second polling. For production, use WebSockets.
- **File Storage**: Images stored locally in `backend/uploads/`. Use S3 in production.
- **Database**: Using MongoDB. Ensure connection is stable.

---

**Last Updated**: May 7, 2026
