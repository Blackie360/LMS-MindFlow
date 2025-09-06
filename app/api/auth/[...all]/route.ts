import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

let auth: any;
let handler: any;

try {
  auth = require("@/lib/auth").auth;
  handler = toNextJsHandler(auth);
} catch (error) {
  console.error("Failed to initialize auth:", error);
}

export async function POST(request: NextRequest) {
  try {
    if (!handler) {
      return NextResponse.json(
        { error: "Auth not initialized", details: "Check server logs" },
        { status: 500 }
      );
    }
    return handler.POST(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!handler) {
      return NextResponse.json(
        { error: "Auth not initialized", details: "Check server logs" },
        { status: 500 }
      );
    }
    return handler.GET(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
