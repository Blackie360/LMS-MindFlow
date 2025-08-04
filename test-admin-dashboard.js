// Simple test script to verify admin dashboard data
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminDashboard() {
  try {
    console.log('Testing admin dashboard data...')
    
    // Check if there are any users
    const userCount = await prisma.user.count()
    console.log(`Total users: ${userCount}`)
    
    // Check roles
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    const instructorCount = await prisma.user.count({ where: { role: 'INSTRUCTOR' } })
    console.log(`Students: ${studentCount}, Instructors: ${instructorCount}`)
    
    // Check courses
    const courseCount = await prisma.course.count()
    console.log(`Total courses: ${courseCount}`)
    
    // Check enrollments
    const enrollmentCount = await prisma.enrollment.count()
    console.log(`Total enrollments: ${enrollmentCount}`)
    
    // Check lesson completions
    const completionCount = await prisma.lessonCompletion.count()
    console.log(`Total lesson completions: ${completionCount}`)
    
    console.log('Admin dashboard data test completed successfully!')
    
  } catch (error) {
    console.error('Error testing admin dashboard:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminDashboard()