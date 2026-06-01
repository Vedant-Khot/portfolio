# Quick Start - Testing Doubts & Payment System

## 🚀 Start the Services

### Terminal 1: Backend
```powershell
cd c:\Users\hrish\Downloads\Learn\Projects\PPES-WEBSITE\backend
npm start
# Output: "Connected to MongoDB Atlas" + "listening on port 5000"
```

### Terminal 2: Frontend
```powershell
cd c:\Users\hrish\Downloads\Learn\Projects\PPES-WEBSITE\frontend
npm run dev
# Output: "Local: http://localhost:3000"
```

---

## 🧪 Test Users (Use These Exact IDs)

### Login as Student
In browser console (F12 → Console):
```javascript
sessionStorage.setItem('userId', 'student_01');
sessionStorage.setItem('userRole', 'student');
location.reload();
```
- Name: **Aryan Verma**
- Email: aryan@student.edu
- Can: Create doubts, add messages, mark resolved

### Login as Teacher
```javascript
sessionStorage.setItem('userId', 'faculty_01');
sessionStorage.setItem('userRole', 'teacher');
location.reload();
```
- Name: **Dr. Smith**
- Email: smith@ppes.edu
- Can: View assigned doubts, add messages

### Login as Student 2
```javascript
sessionStorage.setItem('userId', 'student_02');
sessionStorage.setItem('userRole', 'student');
location.reload();
```
- Name: **Aditi Sharma**
- Email: aditi@student.edu

---

## ✅ Test Workflow

### 1. Create a Doubt (as student_01)
```
Navigate to: http://localhost:3000/doubts/new
Fill form:
  - Title: "How to integrate Razorpay?"
  - Subject: Any subject
  - Message: "I need help with payment gateway"
  - (Optional) Upload image
Click: Submit
```

### 2. View Doubt (as student_01)
```
Navigate to: http://localhost:3000/doubts
See: List of your created doubts
Click: Any doubt to view full thread
```

### 3. Respond as Teacher (as faculty_01)
```
Login as faculty_01 (use code above)
Navigate to: http://localhost:3000/doubts
See: Assigned doubts
Click: Same doubt from step 1
Add: Reply message with solution
```

### 4. Mark Resolved (as student_01)
```
Switch back to student_01
View: Same doubt detail page
Click: "Mark as Resolved"
Status: Changes from "open" to "resolved"
```

### 5. Test Payment
```
Navigate to: http://localhost:3000/test-payment
Enter: 5
Click: Pay with Razorpay button
Use test card:
  - Number: 4111111111111111
  - Expiry: 12/25
  - CVV: 123
Click: Pay
Result: Success message appears
```

---

## 🔍 Test via cURL (Command Line)

### Create Doubt
```bash
curl -X POST http://localhost:5000/api/v1/doubts `
  -H "Content-Type: application/json" `
  -H "x-user-id: student_01" `
  -H "x-user-role: student" `
  -d '{
    "title": "Curl Test Doubt",
    "subject_id": "math-101",
    "initial_message": {"text": "Testing from CLI"},
    "teacher_id": "faculty_01"
  }'
```

### Get All Doubts
```bash
curl -X GET http://localhost:5000/api/v1/doubts `
  -H "x-user-id: student_01" `
  -H "x-user-role: student"
```

### Add Message to Doubt (Replace DOUBT_ID)
```bash
curl -X POST http://localhost:5000/api/v1/messages `
  -H "Content-Type: application/json" `
  -H "x-user-id: faculty_01" `
  -H "x-user-role: teacher" `
  -d '{
    "doubt_id": "DOUBT_ID",
    "text": "Here is the solution..."
  }'
```

---

## 📋 Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts at http://localhost:3000
- [ ] Can set userId/userRole in console
- [ ] Can navigate to /doubts page
- [ ] Can create doubt on /doubts/new
- [ ] Can see doubt details with messages
- [ ] Teacher can add replies
- [ ] Can change doubt status
- [ ] Payment modal opens
- [ ] Can complete test payment

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `MONGODB_URI not found` | Check backend/.env has MONGODB_URI |
| `Cannot GET /doubts` | Ensure frontend pages are in app/doubts/ |
| `Missing auth headers` | Set userId/userRole in console |
| `Unauthorized access` | Use correct userId/userRole for the action |
| `No images uploading` | Backend/uploads directory must exist |

---

## 📁 File Structure Created

```
backend/
├── models/
│   ├── Doubt.js          ✅
│   ├── Message.js        ✅
│   └── (existing models)
├── controllers/
│   ├── doubtController.js      ✅
│   └── messageController.js    ✅
├── routes/
│   ├── doubtRoutes.js          ✅
│   ├── messageRoutes.js        ✅
│   └── uploadRoutes.js         ✅
├── middleware/
│   └── auth.js                 ✅
└── server.js (UPDATED)         ✅

frontend/
├── app/
│   ├── doubts/
│   │   ├── page.tsx            ✅
│   │   ├── new/page.tsx        ✅
│   │   └── [id]/page.tsx       ✅
│   ├── api/payment/ (existing)
│   └── test-payment/ (existing)
└── lib/
    └── api.ts                  ✅
```

---

**Next**: See [docs/TESTING-GUIDE.md](../docs/TESTING-GUIDE.md) for detailed API documentation.
