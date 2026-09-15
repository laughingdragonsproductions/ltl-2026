import { NextResponse } from "next/server";
import Stripe from "stripe";
import { UNLOCK_DEADLINE } from "@/lib/unlock-state";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  let sessionId: string;
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const stripe = new Stripe(secret);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    return NextResponse.json({
      unlockedUntil: UNLOCK_DEADLINE,
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
}
