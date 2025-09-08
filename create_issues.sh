#!/bin/bash

# GitHub Issues Creation Helper Script
# This script provides the commands to create all issues via GitHub CLI

echo "GitHub Issues Creation Helper"
echo "============================="
echo ""
echo "Prerequisites:"
echo "1. Install GitHub CLI: https://cli.github.com/"
echo "2. Login to GitHub: gh auth login"
echo "3. Navigate to your repository directory"
echo ""
echo "Copy and paste each command below to create the issues:"
echo ""

echo "# High Priority Issues"
echo ""

echo "# 1. Assignment System"
echo 'gh issue create --title "Implement Assignment Creation and Submission System" --body "Currently, the LMS lacks a comprehensive assignment system. Instructors need the ability to create assignments with due dates, descriptions, and file uploads, while students need to submit their work and receive grades.

**User Story:**
As an instructor, I want to create assignments for my courses so that I can evaluate student understanding and provide structured learning activities.

**Acceptance Criteria:**
- [ ] Instructors can create assignments with title, description, due date, and point value
- [ ] Support for file upload requirements (PDFs, documents, images)
- [ ] Students can view assignments in their course dashboard
- [ ] Students can submit assignments with file uploads and text responses
- [ ] Late submission tracking and notifications
- [ ] Assignment status indicators (draft, published, due, overdue)
- [ ] Basic grading interface for instructors

**Estimated Effort:** Large (3-4 weeks)" --label "enhancement,feature,high-priority,course-management"'
echo ""

echo "# 2. Quiz System"
echo 'gh issue create --title "Build Quiz and Assessment System" --body "Add a comprehensive quiz system that allows instructors to create various types of assessments (multiple choice, true/false, short answer) with automatic grading capabilities.

**User Story:**
As an instructor, I want to create quizzes with different question types so that I can assess student knowledge efficiently and provide immediate feedback.

**Acceptance Criteria:**
- [ ] Support for multiple question types (multiple choice, true/false, short answer, essay)
- [ ] Quiz creation interface with question bank
- [ ] Time limits and attempt restrictions
- [ ] Automatic grading for objective questions
- [ ] Detailed results and analytics
- [ ] Question randomization options
- [ ] Student quiz-taking interface with progress saving
- [ ] Grade export functionality

**Estimated Effort:** Large (4-5 weeks)" --label "enhancement,feature,high-priority,assessment"'
echo ""

echo "# 3. Student Analytics"
echo 'gh issue create --title "Enhance Student Progress Tracking and Analytics" --body "Improve the current analytics system with detailed student progress tracking, completion rates, time spent on courses, and predictive analytics for at-risk students.

**User Story:**
As an instructor, I want to see detailed analytics about student progress so that I can identify struggling students and adjust my teaching methods accordingly.

**Acceptance Criteria:**
- [ ] Individual student progress dashboards
- [ ] Course completion tracking with milestones
- [ ] Time-on-task analytics
- [ ] Learning path visualization
- [ ] At-risk student identification algorithms
- [ ] Engagement metrics (logins, content views, interaction frequency)
- [ ] Comparative analytics across courses
- [ ] Exportable progress reports

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,feature,medium-priority,analytics"'
echo ""

echo "# 4. Messaging System"
echo 'gh issue create --title "Implement Real-time Messaging and Communication System" --body "Add a messaging system that allows communication between instructors and students, including course announcements, private messages, and discussion forums.

**User Story:**
As a student, I want to communicate with my instructors and peers so that I can ask questions, participate in discussions, and stay updated with course announcements.

**Acceptance Criteria:**
- [ ] Private messaging between users
- [ ] Course-wide announcement system
- [ ] Discussion forums for each course
- [ ] Real-time notifications for new messages
- [ ] Message threading and replies
- [ ] File sharing in messages
- [ ] Message search functionality
- [ ] Moderation tools for instructors

**Estimated Effort:** Large (3-4 weeks)" --label "enhancement,feature,medium-priority,communication"'
echo ""

echo "# Medium Priority Issues"
echo ""

echo "# 5. Content Management"
echo 'gh issue create --title "Add Course Content Management with Multimedia Support" --body "Enhance the course creation system to support rich content including videos, interactive elements, downloadable resources, and structured learning modules.

**User Story:**
As an instructor, I want to create rich course content with videos, documents, and interactive elements so that I can provide engaging learning experiences.

**Acceptance Criteria:**
- [ ] Video upload and streaming capabilities
- [ ] Document and resource file management
- [ ] Interactive content embedding (H5P, YouTube, etc.)
- [ ] Course module and lesson organization
- [ ] Content sequencing and prerequisites
- [ ] Progress tracking for content consumption
- [ ] Mobile-responsive content player
- [ ] Content versioning system

**Estimated Effort:** Large (4-5 weeks)" --label "enhancement,feature,medium-priority,content-management"'
echo ""

echo "# 6. Gradebook System"
echo 'gh issue create --title "Implement Gradebook and Advanced Grading Features" --body "Create a comprehensive gradebook system with weighted categories, grade calculations, and advanced grading features like rubrics and peer assessments.

**User Story:**
As an instructor, I want a full-featured gradebook so that I can track student performance, calculate final grades, and provide detailed feedback.

**Acceptance Criteria:**
- [ ] Weighted grade categories (assignments, quizzes, participation)
- [ ] Customizable grading scales and schemes
- [ ] Rubric-based grading system
- [ ] Bulk grading operations
- [ ] Grade import/export functionality
- [ ] Student grade transparency controls
- [ ] Grade curve and statistical analysis
- [ ] Parent/guardian access to grades

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,feature,medium-priority,grading"'
echo ""

echo "# 7. Calendar Integration"
echo 'gh issue create --title "Add Calendar Integration and Scheduling Features" --body "Integrate a calendar system for course schedules, assignment due dates, office hours, and important events with external calendar sync.

**User Story:**
As a user, I want to see all course-related dates in a calendar view so that I can manage my time effectively and never miss important deadlines.

**Acceptance Criteria:**
- [ ] Integrated calendar view for all users
- [ ] Course schedule management
- [ ] Assignment and quiz due date integration
- [ ] Event creation and management
- [ ] Reminder notifications
- [ ] External calendar sync (Google Calendar, Outlook)
- [ ] Recurring event support
- [ ] Time zone handling

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,feature,medium-priority,scheduling"'
echo ""

echo "# 8. Mobile & PWA"
echo 'gh issue create --title "Enhance Mobile Responsiveness and PWA Features" --body "Improve mobile experience and add Progressive Web App (PWA) capabilities for offline access and native app-like experience.

**User Story:**
As a student, I want to access the LMS on my mobile device with offline capabilities so that I can learn anywhere, even without internet connection.

**Acceptance Criteria:**
- [ ] Fully responsive design for all screen sizes
- [ ] PWA installation capability
- [ ] Offline content access
- [ ] Push notifications
- [ ] Mobile-optimized navigation
- [ ] Touch-friendly interface elements
- [ ] Fast loading on mobile networks
- [ ] Native app store deployment guides

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,ui/ux,medium-priority,mobile,pwa"'
echo ""

echo "# Lower Priority Issues"
echo ""

echo "# 9. Accessibility"
echo 'gh issue create --title "Add Accessibility Improvements (WCAG 2.1 Compliance)" --body "Implement comprehensive accessibility improvements to ensure the platform is usable by people with disabilities and meets WCAG 2.1 AA standards.

**User Story:**
As a user with disabilities, I want to be able to fully access and use the LMS platform so that I can participate equally in online learning.

**Acceptance Criteria:**
- [ ] Keyboard navigation support for all interface elements
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Alt text for all images and media
- [ ] Focus management and visual indicators
- [ ] Accessible form labels and error messages
- [ ] Video captions and transcripts
- [ ] ARIA labels and semantic HTML

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,accessibility,low-priority,a11y"'
echo ""

echo "# 10. Search Features"
echo 'gh issue create --title "Implement Advanced Search and Filtering" --body "Add comprehensive search functionality across courses, content, users, and discussions with advanced filtering options.

**User Story:**
As a user, I want to quickly find specific content, courses, or information so that I can efficiently navigate the platform and locate what I need.

**Acceptance Criteria:**
- [ ] Global search across all content types
- [ ] Advanced filtering options
- [ ] Search result ranking and relevance
- [ ] Search history and saved searches
- [ ] Auto-complete and suggestions
- [ ] Search within specific courses
- [ ] Tag-based content organization
- [ ] Full-text search in documents

**Estimated Effort:** Medium (2-3 weeks)" --label "enhancement,feature,low-priority,search"'
echo ""

echo "# 11. Testing Infrastructure"
echo 'gh issue create --title "Add Comprehensive Testing Infrastructure" --body "Implement a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests to ensure platform reliability.

**User Story:**
As a developer, I want comprehensive test coverage so that I can confidently make changes without breaking existing functionality.

**Acceptance Criteria:**
- [ ] Unit tests for all utility functions and components
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical user flows
- [ ] Test coverage reporting
- [ ] Automated testing in CI/CD pipeline
- [ ] Performance testing setup
- [ ] Load testing for scalability
- [ ] Database migration testing

**Estimated Effort:** Large (3-4 weeks)" --label "testing,infrastructure,low-priority,quality"'
echo ""

echo "# 12. Third-party Integrations"
echo 'gh issue create --title "Implement Third-party Integrations" --body "Add integrations with popular educational tools and platforms like Google Classroom, Zoom, Moodle, and learning content providers.

**User Story:**
As an instructor, I want to integrate with external tools I already use so that I can have a seamless workflow across platforms.

**Acceptance Criteria:**
- [ ] Google Classroom integration
- [ ] Zoom meeting scheduling and integration
- [ ] LTI (Learning Tools Interoperability) support
- [ ] Single Sign-On (SSO) with popular providers
- [ ] API documentation for external integrations
- [ ] Webhook support for real-time updates
- [ ] Import/export standards compliance (QTI, SCORM)
- [ ] Plagiarism detection service integration

**Estimated Effort:** Large (4-5 weeks)" --label "enhancement,feature,low-priority,integrations"'
echo ""

echo "============================="
echo "Instructions:"
echo "1. Copy each command above (starting with 'gh issue create')"
echo "2. Paste and run in your terminal"
echo "3. The issue will be created and assigned to you"
echo "4. Repeat for all issues you want to create"
echo ""
echo "You can also create them manually using the GitHub web interface"
echo "and the templates provided in QUICK_ISSUE_TEMPLATES.md"