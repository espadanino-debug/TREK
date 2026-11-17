import { connection, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { getActor, getQuota } from "@/lib/quota";

// Tells the tool how many free pages / credits the visitor has left.
export async function GET() {
  await connection(); // per-visitor data: never prerender
  try {
    const actor = await getActor();
    const quota = await getQuota(actor);
    return NextResponse.json(quota, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return handleApiError(err, "quota");
  }
}
