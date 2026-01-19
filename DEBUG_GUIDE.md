# Debugging Guide for Document Upload Error

## Current Issue
The document upload is failing with a **400 Bad Request** error. I've added detailed logging to help identify the exact problem.

## How to Debug

### Step 1: Check Backend Server Logs
1. Look at your **backend terminal** where the server is running
2. When you try to upload a document, you should see:
   ```
   POST /api/documents
   📄 Document POST request body: { name: '...', type: '...', fileUrl: '...', ... }
   ```
3. If there are validation errors, you'll see:
   ```
   ❌ Validation errors: [{ msg: '...', param: '...', ... }]
   ```

### Step 2: Check Browser Console
1. Open **DevTools** in your browser (F12)
2. Go to the **Console** tab
3. Try to upload a document
4. You should see:
   ```
   Sending document data: { name: '...', type: '...', fileUrl: '...', ... }
   ```
5. If there's an error, you'll see:
   ```
   Error response: { success: false, errors: [...] }
   Error status: 400
   ```

### Step 3: Common Issues & Solutions

#### Issue 1: "Document name is required"
- **Cause**: The `name` field is empty
- **Solution**: Make sure you fill in the "Document Name" field

#### Issue 2: "Document type is required"
- **Cause**: The `type` field is empty or invalid
- **Solution**: Select a valid document type from the dropdown

#### Issue 3: "File URL is required"
- **Cause**: The `fileUrl` field is empty
- **Solution**: Enter a valid file URL in the "File URL" field

#### Issue 4: "Cast to ObjectId failed"
- **Cause**: Invalid employee ID format
- **Solution**: This should be fixed now - empty employee fields are removed before sending

#### Issue 5: Authentication Error
- **Cause**: No valid token or expired token
- **Solution**: Try logging out and logging back in

### Step 4: Test with Minimal Data
Try uploading a document with just the required fields:
- **Document Name**: Test Document
- **Type**: Other
- **File URL**: https://example.com/test.pdf
- Leave **Employee ID** empty
- Leave **Description** empty

### Step 5: Check Network Tab
1. Open **DevTools** → **Network** tab
2. Try to upload a document
3. Find the `/api/documents` request
4. Click on it and check:
   - **Request Headers**: Should have `Authorization: Bearer <token>`
   - **Request Payload**: Should show the data being sent
   - **Response**: Should show the error details

## What I Fixed

### Frontend (DocumentManager.jsx)
✅ Added logging to show what data is being sent
✅ Removed empty optional fields (employee, description) before sending
✅ Fixed `fileURL` → `fileUrl` property name
✅ Fixed `uploadedBy.username` → `uploadedBy.firstName` and `lastName`

### Backend (documentRoutes.js)
✅ Added logging to show received data
✅ Added logging to show validation errors
✅ Added logging to show document creation errors

## Next Steps
1. Try uploading a document again
2. Check both **backend logs** and **browser console**
3. Share the exact error messages you see
4. If you see validation errors, tell me which field is failing

## Quick Test Command
If the backend isn't running, start it with:
```bash
cd "d:\HR ERP\hr-erp-system\backend"
npm start
```

If the frontend isn't running, start it with:
```bash
cd "d:\HR ERP\hr-erp-system\frontend"
npm start
```
