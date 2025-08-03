-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Programming', 'Learn various programming languages and frameworks'),
('Design', 'UI/UX Design, Graphic Design, and Creative Skills'),
('Business', 'Business Strategy, Marketing, and Entrepreneurship'),
('Data Science', 'Data Analysis, Machine Learning, and Statistics'),
('Marketing', 'Digital Marketing, Social Media, and Growth Strategies'),
('Photography', 'Digital Photography, Photo Editing, and Visual Storytelling')
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses (without instructor_id for now - will be updated after admin user is created)
INSERT INTO courses (title, description, category_id, status, price) VALUES
(
  'Complete React Development Course',
  'Learn React from basics to advanced concepts including hooks, context, and modern patterns. This comprehensive course covers everything you need to know to become a proficient React developer. You''ll build real projects and learn industry best practices.',
  (SELECT id FROM categories WHERE name = 'Programming' LIMIT 1),
  'published',
  99.99
),
(
  'UI/UX Design Fundamentals',
  'Master the principles of user interface and user experience design. Learn design thinking, prototyping, and create beautiful, functional interfaces. This course covers everything from wireframing to high-fidelity prototypes.',
  (SELECT id FROM categories WHERE name = 'Design' LIMIT 1),
  'published',
  79.99
),
(
  'Data Science with Python',
  'Learn data analysis, visualization, and machine learning with Python. Perfect for beginners who want to enter the field of data science. Covers pandas, numpy, matplotlib, and scikit-learn.',
  (SELECT id FROM categories WHERE name = 'Data Science' LIMIT 1),
  'published',
  129.99
),
(
  'Business Strategy Essentials',
  'Learn the fundamentals of business strategy, market analysis, and competitive positioning. Perfect for entrepreneurs and business professionals looking to develop strategic thinking skills.',
  (SELECT id FROM categories WHERE name = 'Business' LIMIT 1),
  'published',
  89.99
),
(
  'Digital Marketing Mastery',
  'Complete guide to digital marketing including SEO, social media marketing, email marketing, and paid advertising. Learn to create effective marketing campaigns that drive results.',
  (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1),
  'published',
  109.99
),
(
  'Advanced JavaScript Concepts',
  'Deep dive into advanced JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features. Perfect for developers looking to level up their skills.',
  (SELECT id FROM categories WHERE name = 'Programming' LIMIT 1),
  'draft',
  119.99
)
ON CONFLICT DO NOTHING;

-- Insert sample lessons for React course
INSERT INTO lessons (course_id, title, description, content, lesson_type, order_index, duration) VALUES
(
  (SELECT id FROM courses WHERE title = 'Complete React Development Course' LIMIT 1),
  'Introduction to React',
  'Learn what React is and why it''s popular',
  '# Introduction to React

React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook and is now maintained by Facebook and the community.

## What makes React special?

1. **Component-Based**: Build encapsulated components that manage their own state
2. **Declarative**: React makes it painless to create interactive UIs
3. **Learn Once, Write Anywhere**: You can develop new features without rewriting existing code

## Key Concepts

- **JSX**: A syntax extension for JavaScript
- **Components**: The building blocks of React applications
- **Props**: How components communicate with each other
- **State**: How components manage their data

## Why Learn React?

- **High Demand**: React developers are in high demand
- **Great Ecosystem**: Huge community and library support
- **Performance**: Virtual DOM makes React apps fast
- **Flexibility**: Can be used for web, mobile, and desktop apps

Let''s dive deeper into these concepts in the following lessons!',
  'text',
  1,
  30
),
(
  (SELECT id FROM courses WHERE title = 'Complete React Development Course' LIMIT 1),
  'Setting up Your Development Environment',
  'Install Node.js, npm, and create your first React app',
  '# Setting up Your Development Environment

Before we start coding with React, we need to set up our development environment properly.

## Prerequisites

1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org)
   - Choose the LTS (Long Term Support) version
   - This includes npm (Node Package Manager)

2. **Code Editor**: We recommend VS Code
   - Download from [code.visualstudio.com](https://code.visualstudio.com)
   - Install useful extensions: ES7+ React/Redux/React-Native snippets

3. **Git**: For version control
   - Download from [git-scm.com](https://git-scm.com)

## Creating Your First React App

The easiest way to start a React project is using Create React App:

```bash
npx create-react-app my-first-app
cd my-first-app
npm start
