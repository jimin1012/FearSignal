import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await buildSnapshot(true);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
