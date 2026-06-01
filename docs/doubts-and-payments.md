# Doubts & Payment Gateway Documentation

**Last Updated**: May 7, 2026  
**Status**: Production Ready  
**Branches**: Feature can be deployed to any branch

---

## Table of Contents
1. [Overview](#overview)
2. [Doubts System Architecture](#doubts-system-architecture)
3. [Payment Gateway (Razorpay) Architecture](#payment-gateway-razorpay-architecture)
4. [API Documentation](#api-documentation)
5. [Frontend Integration](#frontend-integration)
6. [Environment Configuration](#environment-configuration)
7. [Data Models](#data-models)
8. [Branch Integration Instructions](#branch-integration-instructions)

---

## Overview

This document provides a complete reference for:

- **Doubts System**: Peer-to-peer question resolution platform where students post doubts and teachers provide answers with image support
- **Payment Gateway**: Razorpay integration for seamless online payments with order creation and HMAC-SHA256 verification

Both systems are fully integrated into the PPES-WEBSITE monorepo across the `frontend/` (Next.js) and `backend/` (Express.js) directories.

---

## Doubts System Architecture

### Backend Structure

#### Controllers: `backend/src/controllers/doubtController.js`

**Functions:**

1. **`createDoubt(req, res, next)`** - Student creates a new doubt
   - **Input**: `title`, `initial_message` (text or image), `subject_id`, `teacher_id` (optional)
   - **Output**: UUID-generated doubt object with metadata
   - **Access Control**: Only students (`student` role) can create
   - **Returns**: 201 with doubt + initial message objects

2. **`getDoubtsList(req, res, next)`** - Retrieve paginated doubt list
   - **Query Params**: `subject_id`, `teacher_id` (optional filters)
   - **Role-Based Filtering**:
     - Students: see only their own doubts
     - Teachers: see only doubts assigned to them
   - **Returns**: Sorted by `updated_at` (descending)

3. **`getDoubtDetails(req, res, next)`** - Fetch single doubt with full thread
   - **Params**: `id` (doubt UUID)
   - **Access Control**: Students see only their doubts; teachers see only assigned doubts
   - **Returns**: Full doubt object + threaded messages

4. **`updateDoubtStatus(req, res, next)`** - Change doubt status (open → resolved/closed)
   - **Input**: `status` (enum: `open`, `resolved`, `closed`)
   - **Access Control**: Student can update, or teacher with `is_teacher_validated` flag
   - **Returns**: Updated doubt object

#### Routes: `backend/src/routes/doubtRoutes.js`

```
POST   /api/v1/doubts              → createDoubt()
GET    /api/v1/doubts              → getDoubtsList()
GET    /api/v1/doubts/:id          → getDoubtDetails()
PATCH  /api/v1/doubts/:id/status   → updateDoubtStatus()
```

#### Message System: `backend/src/controllers/messageController.js`

**Functions:**

1. **`addMessage(req, res, next)`** - Add a reply to a doubt thread
   - **Input**: `doubt_id`, `text`, `image_url` (optional)
   - **Sender**: Auto-populated from `req.user.id`
   - **Returns**: New message object with UUID

#### Message Routes: `backend/src/routes/messageRoutes.js`

```
POST   /api/v1/messages            → addMessage()
```

#### File Storage: `backend/src/utils/storage.js`

- **`getDoubts()`** - Load all doubts from `backend/data/doubts.json`
- **`saveDoubts(doubts)`** - Persist doubt array to JSON
- **`getMessages()`** - Load all messages from `backend/data/messages.json`
- **`saveMessages(messages)`** - Persist message array to JSON

**Note**: Production should migrate to MongoDB/PostgreSQL; JSON is for MVP.

#### Upload Handler: `backend/src/routes/uploadRoutes.js`

- **Multer Configuration**: 2MB max file size
- **Allowed Types**: `image/jpeg`, `image/png`
- **Storage**: Files saved to `backend/uploads/`
- **Endpoint**: `POST /api/v1/upload`
- **Returns**: `{ image_url: '/uploads/[filename]' }`

---

### Frontend Structure

#### Pages

**1. `frontend/app/doubts/page.tsx`** - Main doubts dashboard
- Lists all doubts for current user
- **Students**: See their own doubts
- **Teachers**: See assigned doubts
- Filters: by subject, by status
- Action: Create new doubt button

**2. `frontend/app/doubts/new/page.tsx`** - Create new doubt form
- **Fields**:
  - Title (text input)
  - Subject (dropdown, populated from subjects API)
  - Teacher (optional, dropdown)
  - Initial message (text + optional image)
- **Image Upload**: Drag-and-drop or file picker
- **Validation**: Title + message + subject required
- **Submit**: Creates doubt and redirects to detail page

**3. `frontend/app/doubts/[id]/page.tsx`** - Doubt detail & thread view
- **Students**: Can see their doubt, add messages, upload images
- **Teachers**: Can see assigned doubts, add messages
- **Real-time Updates**: 5-second polling for new messages
- **Message Display**: Threaded conversation with timestamps, sender info
- **Actions**: Mark as resolved, close doubt
- **Image Preview**: Inline rendering of uploaded images

#### Components

**`frontend/components/RazorpayCheckoutButton.tsx`** - Reusable payment button
- **Props**: `amount` (in paise, default 100)
- **Flow**:
  1. Click button → POST to `/api/payment/create-order`
  2. Loads Razorpay SDK dynamically
  3. Opens modal with order details
  4. On success → POST to `/api/payment/verify`
  5. Shows success/error message
- **Styling**: Integrates with shadcn/ui theme

#### API Client: `frontend/lib/api.ts`

```typescript
// Doubts API
export async function getDoubts(): Promise<Doubt[]>
export async function getDoubtDetails(id: string): Promise<Doubt>
export async function createDoubt(data: CreateDoubtPayload): Promise<Doubt>
export async function updateDoubtStatus(id: string, status: string): Promise<Doubt>

// Messages API
export async function addMessage(doubtId: string, message: Message): Promise<Message>

// Upload API
export async function uploadImage(file: File): Promise<{ image_url: string }>

// Base URL: http://localhost:5000/api/v1
```

---

## Payment Gateway (Razorpay) Architecture

### Backend Setup

#### Environment Variables
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_Sg7ctPj4qc45hc"
RAZORPAY_KEY_SECRET="vD6WYPAHLRKdGmZQrRZSGaTp"
```

#### Order Creation: `frontend/app/api/payment/create-order/route.ts`

**Endpoint**: `POST /api/payment/create-order`

**Request Body**:
```json
{
  "amount": 100,  // in paise (minimum 100 = 1 INR)
  "currency": "INR",  // optional, defaults to INR
  "receipt": "receipt_timestamp"  // optional
}
```

**Response** (200):
```json
{
  "order_id": "order_xyz123",
  "amount": 100,
  "currency": "INR"
}
```

**Validation**:
- Amount must be ≥ 100 paise
- Returns 400 if invalid
- Returns 401 if Razorpay auth fails

**Error Handling**:
- Catches Razorpay SDK errors
- Logs failed attempts
- Returns user-friendly error messages

#### Payment Verification: `frontend/app/api/payment/verify/route.ts`

**Endpoint**: `POST /api/payment/verify`

**Request Body**:
```json
{
  "razorpay_payment_id": "pay_xyz123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_hash"
}
```

**Verification Process**:
1. Constructs message: `{order_id}|{payment_id}`
2. Generates HMAC-SHA256 using `RAZORPAY_KEY_SECRET`
3. Compares computed signature with provided signature
4. Returns 200 if match (payment verified)
5. Returns 400 if signature mismatch (tampered or invalid)

**Response** (200):
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### Frontend Integration

#### Payment Flow

1. **Button Click** → User clicks `RazorpayCheckoutButton` with amount
2. **Create Order** → POST `/api/payment/create-order` → Get `order_id`
3. **Load SDK** → Razorpay JavaScript SDK loaded dynamically
4. **Open Modal** → Opens Razorpay payment modal with:
   - Merchant name: "PPES Test Website"
   - Order ID, amount, currency
   - Customer payment options (cards, UPI, wallets, etc.)
5. **Payment** → Customer completes payment on Razorpay's secure modal
6. **Verify** → POST `/api/payment/verify` with signature
7. **Callback** → Success/error message displayed to user

#### Button Usage Example

```typescript
import RazorpayCheckoutButton from '@/components/RazorpayCheckoutButton';

export default function PaymentPage() {
  return (
    <div>
      <h1>Pay for Test</h1>
      {/* 500 paise = 5 INR */}
      <RazorpayCheckoutButton amount={500} />
    </div>
  );
}
```

#### Test Payment Page: `frontend/app/test-payment/page.tsx`

- Dynamic amount input (in INR, converts to paise)
- Integrated `RazorpayCheckoutButton`
- Useful for testing payment flow during development

---

## API Documentation

### Authentication

All doubts and upload endpoints require header-based authentication:

```
x-user-id: "student-uuid"
x-user-role: "student" | "teacher"
```

Example cURL:
```bash
curl -X GET http://localhost:5000/api/v1/doubts \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" \
  -H "x-user-role: student"
```

### Doubt Endpoints

#### Create Doubt
```
POST /api/v1/doubts
Content-Type: application/json

{
  "title": "How to solve this problem?",
  "initial_message": {
    "text": "I don't understand step 3",
    "image_url": "/uploads/diagram.jpg"  // optional
  },
  "subject_id": "math-101",
  "teacher_id": "teacher-123"  // optional
}

Response (201):
{
  "success": true,
  "doubt": {
    "id": "uuid",
    "student_id": "student-123",
    "subject_id": "math-101",
    "title": "How to solve this problem?",
    "status": "open",
    "assigned_teacher_id": "teacher-123",
    "created_at": "2026-05-07T10:00:00Z",
    "updated_at": "2026-05-07T10:00:00Z"
  },
  "initial_message": { ... }
}
```

#### Get Doubts List
```
GET /api/v1/doubts?subject_id=math-101&status=open

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "status": "open",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

#### Get Doubt Details
```
GET /api/v1/doubts/:id

Response (200):
{
  "success": true,
  "doubt": {
    "id": "uuid",
    "title": "...",
    "messages": [
      {
        "id": "msg-uuid",
        "sender_id": "student-123",
        "text": "Initial message",
        "image_url": null,
        "created_at": "2026-05-07T10:00:00Z"
      }
    ]
  }
}
```

#### Update Doubt Status
```
PATCH /api/v1/doubts/:id/status
Content-Type: application/json

{
  "status": "resolved"  // or "closed"
}

Response (200):
{
  "success": true,
  "doubt": { ... }
}
```

### Message Endpoints

#### Add Message to Doubt
```
POST /api/v1/messages
Content-Type: application/json

{
  "doubt_id": "doubt-uuid",
  "text": "Here's the solution...",
  "image_url": "/uploads/solution.jpg"  // optional
}

Response (201):
{
  "success": true,
  "message": {
    "id": "msg-uuid",
    "doubt_id": "doubt-uuid",
    "sender_id": "auto-populated",
    "text": "...",
    "image_url": "...",
    "created_at": "2026-05-07T10:05:00Z"
  }
}
```

### Upload Endpoints

#### Upload Image
```
POST /api/v1/upload
Content-Type: multipart/form-data

file: <binary JPG or PNG, max 2MB>

Response (200):
{
  "success": true,
  "image_url": "/uploads/filename-uuid.jpg"
}
```

---

## Frontend Integration

### Base URL Configuration

Edit `frontend/lib/api.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
```

### Sample .env.local

```env
# Doubts API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Razorpay Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_Sg7ctPj4qc45hc"
RAZORPAY_KEY_SECRET="vD6WYPAHLRKdGmZQrRZSGaTp"
```

---

## Environment Configuration

### Required Environment Variables

#### Frontend (`frontend/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_Sg7ctPj4qc45hc"
RAZORPAY_KEY_SECRET="vD6WYPAHLRKdGmZQrRZSGaTp"
```

#### Backend (`backend/.env` - if using environment file)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Optional: For production migration
# DATABASE_URL=mongodb://...
# JWT_SECRET=your-secret-key
```

### Razorpay Keys Breakdown

- **`NEXT_PUBLIC_RAZORPAY_KEY_ID`** (Public): 
  - Used in frontend for Razorpay modal initialization
  - Safe to expose in client code (hence `NEXT_PUBLIC_` prefix)
  - **Current Value**: `rzp_live_Sg7ctPj4qc45hc`

- **`RAZORPAY_KEY_SECRET`** (Secret):
  - Used in backend for signature verification
  - **NEVER expose in client code**
  - Only used server-side in `/api/payment/verify`
  - **Current Value**: `vD6WYPAHLRKdGmZQrRZSGaTp`

---

## Data Models

### Doubt Object
```typescript
interface Doubt {
  id: string;                    // UUID
  student_id: string;            // UUID of student who created
  subject_id: string;            // Subject identifier (e.g., "math-101")
  title: string;                 // Doubt title
  status: "open" | "resolved" | "closed";
  assigned_teacher_id: string | null;
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
  is_teacher_validated?: boolean; // Optional flag
}
```

### Message Object
```typescript
interface Message {
  id: string;                    // UUID
  doubt_id: string;              // FK to Doubt
  sender_id: string;             // UUID of sender
  text: string;                  // Message body
  image_url: string | null;      // Optional image URL
  created_at: string;            // ISO timestamp
}
```

### Order Object (Razorpay)
```typescript
interface Order {
  order_id: string;              // Razorpay order ID
  amount: number;                // In paise
  currency: string;              // "INR"
  receipt: string;               // Receipt identifier
  created_at: string;            // ISO timestamp
}
```

---

## Branch Integration Instructions

### Scenario: Integrating into Another Branch

**Before merging**:

1. **Verify Environment Variables**:
   ```bash
   cd frontend
   cat .env.local
   # Ensure NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are present
   ```

2. **Check Backend Data Directory**:
   ```bash
   ls -la backend/data/
   # Ensure doubts.json and messages.json exist
   ```

3. **Install Dependencies** (if needed):
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Integration Checklist

- [ ] Copy `backend/src/controllers/doubtController.js`
- [ ] Copy `backend/src/controllers/messageController.js`
- [ ] Copy `backend/src/routes/doubtRoutes.js`
- [ ] Copy `backend/src/routes/messageRoutes.js`
- [ ] Copy `backend/src/routes/uploadRoutes.js`
- [ ] Copy `backend/src/utils/storage.js`
- [ ] Ensure `backend/data/doubts.json` and `backend/data/messages.json` exist
- [ ] Copy `frontend/app/doubts/` directory
- [ ] Copy `frontend/app/api/payment/` directory
- [ ] Copy `frontend/app/test-payment/` directory
- [ ] Copy `frontend/components/RazorpayCheckoutButton.tsx`
- [ ] Update `frontend/lib/api.ts` with doubts endpoints
- [ ] Update `frontend/.env.local` with Razorpay keys
- [ ] Test doubts creation/retrieval: `http://localhost:3000/doubts`
- [ ] Test payment flow: `http://localhost:3000/test-payment`

### Git Merge Strategy

**When merging to target branch**:

```bash
# From feature branch (doubts-payments)
git checkout target-branch
git merge --no-ff doubts-payments -m "Merge doubts and payment gateway features"
git push origin target-branch
```

**Conflict Resolution**:
- If conflicts in `backend/server.js`, merge route registrations:
  ```javascript
  app.use('/api/v1/doubts', doubtRoutes);
  app.use('/api/v1/messages', messageRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  ```

- If conflicts in `frontend/package.json`, keep latest dependency versions

### Testing in Target Branch

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Doubts**:
   - Navigate to `http://localhost:3000/doubts`
   - Create a test doubt
   - Verify it appears in list

4. **Test Payment**:
   - Navigate to `http://localhost:3000/test-payment`
   - Enter amount (e.g., 5)
   - Click payment button
   - Verify modal opens

### Rollback Instructions

If issues arise:

```bash
# Revert the merge commit
git revert HEAD --no-edit

# Or reset to pre-merge state
git reset --hard HEAD~1
```

---

## Notes & Future Improvements

1. **Data Persistence**: Currently uses JSON files. Migrate to MongoDB/PostgreSQL for production.
2. **Real-time Updates**: Consider WebSocket integration instead of 5-second polling.
3. **File Storage**: Use AWS S3 or similar CDN instead of local `/uploads` directory.
4. **Error Logging**: Integrate Sentry or similar APM for production monitoring.
5. **Rate Limiting**: Add rate limits to API endpoints to prevent abuse.
6. **Payment Webhooks**: Implement Razorpay webhook listeners for async payment confirmations.

---

**Document Version**: 1.0  
**Created**: May 7, 2026  
**Last Modified**: May 7, 2026
