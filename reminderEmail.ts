// src/lib/reminderEmail.ts

const TASK_COPY: Record<
  string,
  { subject: string; body: (businessName: string, dueDate: string) => string }
> = {
  NDPC_REGISTRATION: {
    subject: "Action needed: register with the NDPC",
    body: (name, due) =>
      `${name}'s NDPC registration deadline is ${due}. Late registration as a DCPMI can carry additional scrutiny — log into your ClearCheck dashboard to review your registration checklist.`,
  },
  AUDIT_RETURN: {
    subject: "Your Compliance Audit Return is due soon",
    body: (name, due) =>
      `${name}'s annual Compliance Audit Return (CAR) is due ${due}. This must be filed through a licensed Data Protection Compliance Organisation (DPCO) — don't leave it to the last week.`,
  },
  DPO_REGISTRATION: {
    subject: "Confirm your DPO registration",
    body: (name, due) =>
      `${name} needs to confirm Data Protection Officer registration by ${due}. Check your dashboard for the appointment letter template if you haven't generated one yet.`,
  },
  ANNUAL_RENEWAL: {
    subject: "Your ClearCheck subscription renews soon",
    body: (name, due) =>
      `${name}'s ClearCheck subscription renews on ${due}. Renewing keeps your documents up to date and your compliance calendar active.`,
  },
};

export function buildReminderEmail(taskType: string, businessName: string, dueDate: Date) {
  const copy = TASK_COPY[taskType];
  const dueDateFormatted = dueDate.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!copy) {
    return {
      subject: `Compliance reminder for ${businessName}`,
      text: `You have an upcoming compliance task due ${dueDateFormatted}. Log into your ClearCheck dashboard for details.`,
    };
  }

  return {
    subject: copy.subject,
    text: copy.body(businessName, dueDateFormatted),
  };
}
