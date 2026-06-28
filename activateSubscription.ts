// src/lib/activateSubscription.ts
//
// Called after a Paystack payment is confirmed successful — either via the
// callback redirect (/api/checkout/verify) or the webhook
// (/api/webhooks/paystack), whichever fires first. Idempotent: if the
// subscription is already ACTIVE, this is a no-op, so it's safe for both
// paths to call it for the same payment without double-seeding compliance
// tasks or resetting renewal dates.

import { prisma } from "@/lib/prisma";

export async function activateSubscriptionForBusiness(businessId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { businessId } });

  if (!subscription) {
    throw new Error(`No subscription record found for business ${businessId}`);
  }

  // Idempotency guard — don't re-seed tasks or push renewal dates forward
  // if this business was already activated by the other verification path.
  if (subscription.status === "ACTIVE") {
    return { subscription, alreadyActive: true as const };
  }

  const now = new Date();
  const renewsAt = new Date(now);
  renewsAt.setFullYear(renewsAt.getFullYear() + 1);

  const updated = await prisma.subscription.update({
    where: { businessId },
    data: { status: "ACTIVE", startedAt: now, renewsAt },
  });

  // CAR filing is due 31 March each year — pick the next upcoming one.
  const carDueDate = new Date(now.getFullYear(), 2, 31); // March is month index 2
  if (carDueDate < now) carDueDate.setFullYear(carDueDate.getFullYear() + 1);

  const existingTasks = await prisma.complianceTask.count({ where: { businessId } });
  if (existingTasks === 0) {
    await prisma.complianceTask.createMany({
      data: [
        {
          businessId,
          type: "NDPC_REGISTRATION",
          dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 180), // 6 months out
        },
        { businessId, type: "AUDIT_RETURN", dueDate: carDueDate },
        { businessId, type: "ANNUAL_RENEWAL", dueDate: renewsAt },
      ],
    });
  }

  return { subscription: updated, alreadyActive: false as const };
}
