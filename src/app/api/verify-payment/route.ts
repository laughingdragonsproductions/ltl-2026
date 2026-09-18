import { NextResponse } from "next/server";
import Stripe from "stripe";
import { UNLOCK_DEADLINE } from "@/lib/unlock-state";
import {
  isValidCheckoutSessionId,
  redemptionMetadata,
  validatePaidUnlockSession,
} from "@/lib/stripe-verify";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let sessionId: string;
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = (body.sessionId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!sessionId || !isValidCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const stripe = new Stripe(secret);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const validation = validatePaidUnlockSession(session);

    if (!validation.ok) {
      const status =
        validation.reason === "not_paid"
          ? 402
          : validation.reason === "redemption_exhausted"
            ? 403
            : 400;
      return NextResponse.json({ error: validation.reason }, { status });
    }

    await stripe.checkout.sessions.update(sessionId, {
      metadata: redemptionMetadata(session, validation.redeemCount),
    });

    return NextResponse.json({ unlockedUntil: UNLOCK_DEADLINE });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
}
