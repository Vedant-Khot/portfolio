# Headers Fix Applied

## Issue
TypeScript headers type errors in `frontend/lib/api.ts` due to missing type definition for fetch headers.

## Solution
Added proper TypeScript typing for all fetch headers:

### Changes Made:

1. **Added HeadersInit Type Definition**
   ```typescript
   type HeadersInit = Record<string, string>;
   ```

2. **Fixed getAuthHeaders Return Type**
   ```typescript
   export const getAuthHeaders = (): Record<string, string> => {
     // Now properly returns typed object even on server-side
     if (typeof window === 'undefined') {
       return {
         'x-user-id': '',
         'x-user-role': 'student'
       };
     }
     // ... rest of implementation
   }
   ```

3. **Applied HeadersInit Cast to All Fetch Calls**
   - `getDoubts()`: `headers: {...} as HeadersInit`
   - `getDoubtDetails()`: `headers: {...} as HeadersInit`
   - `createDoubt()`: `headers: {...} as HeadersInit`
   - `updateDoubtStatus()`: `headers: {...} as HeadersInit`
   - `addMessage()`: `headers: {...} as HeadersInit`
   - `uploadImage()`: `headers: {...} as HeadersInit`
   - `getSubjects()`: `headers: {...} as HeadersInit`
   - `getTeachers()`: `headers: {...} as HeadersInit`

## Testing
All headers errors should now be resolved. Frontend should build without header-related TypeScript errors.

## File Modified
- `frontend/lib/api.ts` - All fetch functions now have properly typed headers
