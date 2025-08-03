import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create sample instructor
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@mindflow.com" },
    update: {},
    create: {
      email: "instructor@mindflow.com",
      name: "John Instructor",
      role: "INSTRUCTOR",
    },
  })

  // Create sample student
  const student = await prisma.user.upsert({
    where: { email: "student@mindflow.com" },
    update: {},
    create: {
      email: "student@mindflow.com",
      name: "Jane Student",
      role: "STUDENT",
    },
  })

  // Create sample course
  const course = await prisma.course.upsert({
    where: { id: "sample-course-1" },
    update: {},
    create: {
      id: "sample-course-1",
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
      createdBy: instructor.id,
    },
  })

  // Create sample module
  const module1 = await prisma.module.create({
    data: {
      title: "Getting Started",
      order: 1,
      courseId: course.id,
    },
  })

  // Create sample lessons
  await prisma.lesson.createMany({
    data: [
      {
        title: "Introduction to HTML",
        content:
          "# Introduction to HTML\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages.",
        order: 1,
        moduleId: module1.id,
      },
      {
        title: "CSS Basics",
        content: "# CSS Basics\n\nCSS (Cascading Style Sheets) is used to style and layout web pages.",
        order: 2,
        moduleId: module1.id,
      },
    ],
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
