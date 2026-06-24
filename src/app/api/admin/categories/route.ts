import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UpdateCategorySchema = z.object({
  id: z.string().uuid(),
  image: z.string().trim().min(1).nullable(),
});

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = getSupabaseServiceClient();
  if (!sb) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const json = await request.json().catch(() => null);
  const parsed = UpdateCategorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  const { id, image } = parsed.data;
  const { error } = await sb
    .from("categories")
    .update({ image })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
