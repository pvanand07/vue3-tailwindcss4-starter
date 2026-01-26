# File Upload Feature Implementation

## Overview
Added a comprehensive file upload feature to the chat interface that allows users to upload documents and Excel files during conversations.

## Features Implemented

### 1. **DocumentUploadModal Component** (`src/components/features/dashboard/DocumentUploadModal.vue`)
- Full-featured upload modal with drag-and-drop support
- Supports multiple file types: PDF, DOCX, XLSX, XLS
- Real-time file preview before upload
- Uploaded files list with status indicators
- Delete functionality for each uploaded file
- Session management using thread_id or generated session_id
- Automatic cleanup when chat starts

### 2. **Upload API Integration** (`src/api/document.ts`)
- Added `uploadFiles()` method supporting multi-file uploads
- Handles both document and Excel file types
- Returns detailed upload results including:
  - File type (document/excel)
  - Document ID
  - Page count (for documents)
  - Row/column count (for Excel files)
  - Error handling for failed uploads

### 3. **ChatInput Enhancement** (`src/components/features/chat/ChatInput.vue`)
- Added paperclip/upload button next to model selector
- Modal integration with upload button trigger
- Automatic modal closure when user sends first message
- Visual feedback for upload actions

## API Endpoint Usage

### Upload Endpoint
**POST** `/api/v1/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `user_id` (required)
  - `session_id` (optional, auto-generated from thread_id)
  - `files` (multiple files supported)

### Delete Endpoint
**DELETE** `/api/v1/documents/{doc_id}?user_id={user_id}`

## User Flow

1. User clicks the paperclip icon in the chat input
2. Upload modal opens with drag-and-drop area
3. User selects or drags files (PDF, DOCX, XLSX, XLS)
4. Files appear in preview list with remove option
5. User clicks "Upload Files"
6. Successfully uploaded files move to "Uploaded Files" section
7. Each uploaded file has a delete button
8. When user sends first chat message, modal auto-closes and clears preview

## Key Features

- **Smart Session Management**: Uses current thread_id or generates new session_id
- **Multiple File Support**: Upload multiple files at once
- **File Type Validation**: Only accepts supported formats
- **Delete Functionality**: Remove uploaded files individually
- **Auto-cleanup**: Preview clears when chat starts
- **Error Handling**: Displays detailed error messages
- **Loading States**: Shows upload/delete progress
- **Responsive Design**: Works on mobile and desktop

## Technical Details

- Uses FormData for multipart file uploads
- Integrates with Pinia store for user_id and thread_id
- Leverages Vue 3 Composition API
- Tailwind CSS for styling
- Lucide icons for UI elements





