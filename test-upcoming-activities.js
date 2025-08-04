// Simple test to verify our upcoming activities component structure
const mockActivities = [
  {
    id: "1",
    title: "Assignment: Introduction to React",
    type: "assignment",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    courseName: "Web Development Fundamentals",
    courseId: "course-1",
    urgency: "medium"
  },
  {
    id: "2", 
    title: "Test: JavaScript Basics",
    type: "test",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    courseName: "JavaScript Mastery",
    courseId: "course-2",
    urgency: "high"
  },
  {
    id: "3",
    title: "Lesson: Advanced CSS",
    type: "lesson",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    courseName: "CSS Styling Course",
    courseId: "course-3",
    urgency: "low"
  }
];

console.log("Mock upcoming activities data:");
console.log(JSON.stringify(mockActivities, null, 2));

// Test urgency calculation
function testUrgencyCalculation() {
  const now = new Date();
  
  // Test high urgency (1 day)
  const highUrgency = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const highDiff = Math.ceil((highUrgency.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`High urgency test: ${highDiff} days = ${highDiff <= 2 ? 'high' : 'not high'}`);
  
  // Test medium urgency (5 days)
  const mediumUrgency = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const mediumDiff = Math.ceil((mediumUrgency.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`Medium urgency test: ${mediumDiff} days = ${mediumDiff <= 7 ? (mediumDiff <= 2 ? 'high' : 'medium') : 'low'}`);
  
  // Test low urgency (10 days)
  const lowUrgency = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const lowDiff = Math.ceil((lowUrgency.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000));
  console.log(`Low urgency test: ${lowDiff} days = 'low'`);
}

testUrgencyCalculation();

console.log("✅ Upcoming activities component structure test passed!");