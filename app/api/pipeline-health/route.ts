import { db } from "@/db";
import { pipelineHealth } from "@/db/schema";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["success", "failure"] as const;
type PipelineStatus = (typeof ALLOWED_STATUSES)[number];

export async function POST(request: Request) {
  // Verify bearer token
  const auth = request.headers.get("Authorization") ?? "";
  const secret = process.env.PIPELINE_HEALTH_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).name !== "string" ||
    !(ALLOWED_STATUSES as readonly string[]).includes(
      (body as Record<string, unknown>).status as string
    )
  ) {
    return Response.json(
      { error: "Body must be { name: string, status: 'success' | 'failure' }" },
      { status: 400 }
    );
  }

  const { name, status } = body as { name: string; status: PipelineStatus };

  await db
    .insert(pipelineHealth)
    .values({ name, last_run_at: new Date(), status })
    .onConflictDoUpdate({
      target: pipelineHealth.name,
      set: { last_run_at: new Date(), status },
    });

  return Response.json({ ok: true });
}
