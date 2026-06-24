import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

const Schema = z.object({
  id: z.string().uuid(),
  payment_status: z
    .enum(["pending", "paid", "failed", "refunded"])
    .optional(),
  fulfillment_status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
});

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const sb = getSupabaseServiceClient();
  if (!sb) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const json = await request.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }
  const { id, ...update } = parsed.data;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { error } = await sb.from("orders").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
