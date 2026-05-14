import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "not_available",
      message: "Historical signal storage is not enabled in the MVP. No synthetic history is returned.",
    },
    { status: 501 },
  );
}
