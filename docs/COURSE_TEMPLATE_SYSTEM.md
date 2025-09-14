# Course Template System

A comprehensive course creation and management system with topics, reading materials, and template functionality for instructors.

## 🚀 Features

### Course Creation
- **Multi-tab Interface**: Organized into Basic Info, Topics & Materials, and Settings tabs
- **Rich Course Details**: Title, description, category, difficulty level, estimated hours
- **Learning Objectives**: Dynamic list of course learning objectives
- **Prerequisites**: Course prerequisites and requirements

### Topics Management
- **Structured Topics**: Organize course content into logical topics
- **Topic Descriptions**: Detailed descriptions for each topic
- **Order Management**: Drag-and-drop ordering of topics
- **Reading Materials**: Upload and manage reading materials per topic

### Reading Materials
- **File Upload**: Support for multiple file types (PDF, DOC, PPT, images, videos, audio)
- **File Management**: Rename, describe, and organize materials
- **File Size Validation**: 10MB maximum file size limit
- **File Type Validation**: Restricted to educational file types

### Course Templates
- **Template Creation**: Save courses as reusable templates
- **Template Management**: Create, edit, duplicate, and delete templates
- **Template Preview**: Preview template structure and content
- **Template Reuse**: Use templates to quickly create new courses

## 🗄️ Database Schema

### Course Model
```prisma
model Course {
  id          String       @id @default(cuid())
  title       String
  description String?
  thumbnail   String?
  status      CourseStatus @default(DRAFT)
  createdBy   String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Course template fields
  isTemplate   Boolean @default(false)
  templateName String?
  category     String?
  level        String?  // beginner, intermediate, advanced
  estimatedHours Int?
  prerequisites String?
  learningObjectives Json? // Array of learning objectives
  
  // Organization relationship
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  
  instructor  User         @relation("InstructorCourses", fields: [createdBy], references: [id], onDelete: Cascade)
  enrollments Enrollment[]
  modules     Module[]
  topics      Topic[]
  invitations CourseInvitation[]
}
```

### Topic Model
```prisma
model Topic {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  description String?
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  course           Course           @relation(fields: [courseId], references: [id], onDelete: Cascade)
  readingMaterials ReadingMaterial[]
}
```

### Reading Material Model
```prisma
model ReadingMaterial {
  id          String   @id @default(cuid())
  topicId     String
  title       String
  description String?
  fileName    String
  fileUrl     String
  fileSize    Int      // File size in bytes
  fileType    String   // MIME type
  uploadedAt  DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)
}
```

## 🔌 API Endpoints

### Course Management
- `GET /api/courses` - List all courses (with optional filters)
- `POST /api/courses` - Create a new course
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Topic Management
- `GET /api/courses/[id]/topics` - List course topics
- `POST /api/courses/[id]/topics` - Create a new topic
- `PUT /api/courses/[id]/topics/[topicId]` - Update topic
- `DELETE /api/courses/[id]/topics/[topicId]` - Delete topic

### Reading Material Management
- `GET /api/courses/[id]/topics/[topicId]/reading-materials` - List reading materials
- `POST /api/courses/[id]/topics/[topicId]/reading-materials` - Upload reading material
- `PUT /api/courses/[id]/topics/[topicId]/reading-materials/[materialId]` - Update reading material
- `DELETE /api/courses/[id]/topics/[topicId]/reading-materials/[materialId]` - Delete reading material

### File Upload
- `POST /api/upload` - Upload files for reading materials

## 🎨 Components

### CreateCourseForm
A comprehensive form for creating courses with topics and reading materials.

**Features:**
- Tabbed interface (Basic Info, Topics & Materials, Settings)
- Dynamic topic management
- File upload for reading materials
- Learning objectives management
- Template creation options

**Usage:**
```tsx
<CreateCourseForm
  onSuccess={() => console.log('Course created!')}
  onCancel={() => console.log('Cancelled')}
  organizationId="org-123"
/>
```

### CourseManagement
Main dashboard for managing courses and templates.

**Features:**
- Course listing with statistics
- Template management
- Course creation and editing
- Search and filtering

**Usage:**
```tsx
<CourseManagement organizationId="org-123" />
```

### CourseTemplateManager
Dedicated interface for managing course templates.

**Features:**
- Template creation and editing
- Template preview
- Template duplication
- Template deletion

**Usage:**
```tsx
<CourseTemplateManager organizationId="org-123" />
```

## 📁 File Structure

```
components/courses/
├── CreateCourseForm.tsx          # Main course creation form
├── CourseManagement.tsx          # Course management dashboard
└── CourseTemplateManager.tsx     # Template management interface

app/api/
├── courses/
│   ├── route.ts                  # Course CRUD operations
│   ├── [id]/
│   │   ├── route.ts              # Individual course operations
│   │   └── topics/
│   │       ├── route.ts          # Topic CRUD operations
│   │       └── [topicId]/
│   │           ├── route.ts      # Individual topic operations
│   │           └── reading-materials/
│   │               ├── route.ts  # Reading material CRUD
│   │               └── [materialId]/
│   │                   └── route.ts # Individual material operations
└── upload/
    └── route.ts                  # File upload endpoint
```

## 🚀 Getting Started

### 1. Database Migration
Run the migration to create the new tables:
```bash
npx prisma migrate dev --name add_course_templates_and_reading_materials
```

### 2. Component Integration
Import and use the components in your instructor dashboard:

```tsx
import { CourseManagement } from "@/components/courses/CourseManagement";

export default function InstructorDashboard() {
  return (
    <div>
      <CourseManagement organizationId={organizationId} />
    </div>
  );
}
```

### 3. File Upload Configuration
Configure your file storage service in `/app/api/upload/route.ts`:

```typescript
// Replace the mock implementation with your actual file storage
const uploadResult = await uploadToStorage(file);
```

## 🔧 Configuration

### File Upload Limits
- **Maximum file size**: 10MB
- **Allowed file types**: PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, JPEG, PNG, GIF, MP4, WEBM, MP3, WAV

### Course Status
- `DRAFT` - Course is being created/edited
- `PUBLISHED` - Course is live and available to students
- `ARCHIVED` - Course is no longer active

### Course Levels
- `beginner` - Introductory level
- `intermediate` - Some experience required
- `advanced` - Expert level content

## 🎯 Usage Examples

### Creating a Course with Topics
```typescript
const courseData = {
  title: "Web Development Fundamentals",
  description: "Learn the basics of web development",
  category: "Technology",
  level: "beginner",
  estimatedHours: 40,
  prerequisites: "Basic computer skills",
  learningObjectives: [
    "Understand HTML structure",
    "Style pages with CSS",
    "Add interactivity with JavaScript"
  ],
  topics: [
    {
      title: "HTML Basics",
      description: "Introduction to HTML structure and elements",
      readingMaterials: []
    },
    {
      title: "CSS Styling",
      description: "Learn to style web pages with CSS",
      readingMaterials: []
    }
  ]
};
```

### Uploading Reading Materials
```typescript
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const uploadResult = await response.json();
```

## 🔒 Security Considerations

- **File Upload Validation**: File type and size validation
- **Authentication**: All endpoints require authentication
- **Authorization**: Users can only manage their own courses
- **File Storage**: Implement secure file storage (AWS S3, Cloudinary, etc.)

## 🚀 Future Enhancements

- **Drag & Drop**: Topic reordering with drag and drop
- **Bulk Upload**: Multiple file upload at once
- **File Preview**: In-browser file preview
- **Version Control**: Course versioning and history
- **Collaboration**: Multi-instructor course editing
- **Analytics**: Course performance metrics
- **Export/Import**: Course data export and import

## 📝 Notes

- The file upload currently returns mock URLs. Implement actual file storage for production.
- Reading materials are associated with topics, not directly with courses.
- Course templates can be duplicated to create new courses quickly.
- All file operations include proper error handling and validation.
