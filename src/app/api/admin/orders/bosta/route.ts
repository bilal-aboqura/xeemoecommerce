import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  BostaIntegrationError,
  createBostaDelivery,
  syncBostaDelivery,
} from "@/lib/bosta";
import { getBostaOrderById, storeBostaShipment } from "@/lib/bosta-store";

const ActionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["create", "sync"]),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = ActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Bosta action" }, { status: 422 });
  }

  try {
    const order = await getBostaOrderById(parsed.data.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const shipment = parsed.data.action === "create"
      ? await createBostaDelivery(order)
      : order.bosta
        ? await syncBostaDelivery(order.bosta)
        : null;
    if (!shipment) {
      return NextResponse.json({ error: "Create the Bosta shipment first" }, { status: 400 });
    }
    const updated = await storeBostaShipment(order, shipment);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof BostaIntegrationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/admin/orders/bosta]", error);
    return NextResponse.json({ error: "Bosta action failed" }, { status: 500 });
  }
}
