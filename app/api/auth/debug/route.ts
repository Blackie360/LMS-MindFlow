import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    let dbStatus = "unknown";
    let dbError = null;
    try {
      const { prisma } = await import("@/lib/db");
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (error) {
      dbStatus = "error";
      dbError = error instanceof Error ? error.message : "unknown error";
    }

    // Test auth configuration
    let authStatus = "unknown";
    let authError = null;
    try {
      const { auth } = await import("@/lib/auth");
      authStatus = "loaded";
    } catch (error) {
      authStatus = "error";
      authError = error instanceof Error ? error.message : "unknown error";
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        error: dbError,
        url: process.env.DATABASE_URL ? "set" : "not set",
      },
      auth: {
        status: authStatus,
        error: authError,
        secret: process.env.AUTH_SECRET ? "set" : "not set",
        baseURL: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
      environment_variables: {
        AUTH_URL: process.env.AUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        AUTH_SECRET: process.env.AUTH_SECRET ? "***" : "not set",
        DATABASE_URL: process.env.DATABASE_URL ? "***" : "not set",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
