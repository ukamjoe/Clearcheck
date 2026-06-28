// src/lib/generateDocument.ts
//
// Calls the Anthropic API to generate NDPA-compliant documents tailored to a
// specific business profile. Prompts are grounded in NDPA_FACTS.md so outputs
// reference real thresholds/timelines instead of generic GDPR boilerplate.

import Anthropic from "@anthropic-ai/sdk";
import type { BusinessProfile, RiskScoreResult } from "./riskScore";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type DocumentType =
  | "PRIVACY_POLICY"
  | "ROPA"
  | "DPIA"
  | "BREACH_RESPONSE_PLAN"
  | "DPO_APPOINTMENT_LETTER";

const REGULATORY_GROUNDING = `
You are drafting a document for a Nigerian business to help it comply with the
Nigeria Data Protection Act (NDPA) 2023 and the General Application and
Implementation Directive (GAID) 2025, enforced by the Nigeria Data Protection
Commission (NDPC). Ground every clause in these verified facts — do not invent
thresholds, fees, or timelines:

- Personal data breaches must be reported to the NDPC within 72 hours of the
  controller becoming aware (NDPA s.40; GAID Art. 33). Affected data subjects
  must be notified without undue delay if there is high risk to their rights.
- DCPMI (Data Controller/Processor of Major Importance) status is triggered by:
  processing personal data of more than 200 data subjects in a 6-month period,
  OR providing commercial ICT services on devices storing others' personal data,
  OR operating in a designated sector (financial services, health, education,
  e-commerce, insurance, oil & gas, aviation, communication, tourism, hospitality,
  electric power, public service, import/export).
- DCPMIs must register with the NDPC, appoint a Data Protection Officer (DPO),
  and file a Compliance Audit Return (CAR) annually via a licensed Data
  Protection Compliance Organisation (DPCO).
- Penalties: up to ₦10,000,000 or 2% of annual gross revenue (whichever is
  greater) for DCPMIs; up to ₦2,000,000 or 2% of gross revenue for others.
- Core principles: lawfulness, fairness, transparency, purpose limitation,
  data minimization, storage limitation, security, and accountability.
- Six lawful bases: consent, contractual obligation, legal obligation, vital
  interest, public interest, legitimate interest.

Always write in plain, accessible English suitable for a Nigerian small
business owner, not dense legalese. Use Markdown formatting with headers.
Do not include any preamble, explanation, or commentary outside the document
itself — output ONLY the document content.
`;

function buildPrompt(
  type: DocumentType,
  business: { name: string; industry: string },
  profile: BusinessProfile,
  risk: RiskScoreResult
): string {
  const context = `
Business name: ${business.name}
Industry: ${business.industry}
Employee count: ${profile.employeeCount}
Estimated data subjects (6-month rolling): ${profile.estimatedDataSubjects}
DCPMI status: ${risk.isDcpmi ? `Yes, tier ${risk.tier}` : "No"}
Handles sensitive data (health/biometric/etc.): ${profile.handlesSensitiveData ? "Yes" : "No"}
Processes children's data: ${profile.processesChildrensData ? "Yes" : "No"}
Has international data transfer (e.g. cloud tools hosted outside Nigeria): ${
    profile.hasInternationalTransfer ? "Yes" : "No"
  }
`;

  switch (type) {
    case "PRIVACY_POLICY":
      return `${REGULATORY_GROUNDING}\n\nGenerate a complete NDPA-compliant Privacy Policy for this business:\n${context}\n\nInclude: what data is collected, why, lawful basis used, how long it's kept, data subject rights (access, rectification, erasure, objection to automated processing), how to make a request, breach notification commitment, contact details placeholder for the DPO, and cross-border transfer disclosure if applicable.`;

    case "ROPA":
      return `${REGULATORY_GROUNDING}\n\nGenerate a Record of Processing Activities (RoPA) template, pre-filled with reasonable defaults for this business, in a clear Markdown table format:\n${context}\n\nColumns should include: Processing Activity, Purpose, Categories of Data Subjects, Categories of Personal Data, Lawful Basis, Recipients/Third Parties, Retention Period, Security Measures, Cross-Border Transfer (Y/N + safeguard).`;

    case "DPIA":
      return `${REGULATORY_GROUNDING}\n\nGenerate a Data Privacy Impact Assessment (DPIA) for this business, following the GAID's DPIA approach:\n${context}\n\nInclude: description of the processing operation, necessity/proportionality assessment, risk identification (to data subjects' rights and freedoms), the Data Subject Vulnerability considerations, mitigation measures, and a conclusion on residual risk with a recommendation on whether NDPC prior consultation is warranted.`;

    case "BREACH_RESPONSE_PLAN":
      return `${REGULATORY_GROUNDING}\n\nGenerate a Personal Data Breach Response Plan for this business:\n${context}\n\nInclude: an internal escalation procedure starting at hour 0, the 72-hour NDPC notification clock and what to do if full details aren't ready in time, a breach register template, who is responsible internally, what to include in the data-subject notification (per NDPA s.40(3): plain language, breach description, safeguards in place, protective steps the data subject can take), and a post-breach review step.`;

    case "DPO_APPOINTMENT_LETTER":
      return `${REGULATORY_GROUNDING}\n\nGenerate a formal Data Protection Officer (DPO) Appointment Letter for this business:\n${context}\n\nInclude: the appointee's responsibilities (overseeing NDPA compliance, advising on data protection risk, acting as point of contact for the NDPC and data subjects, submitting semi-annual reports to management), a statement of independence (DPO must not be instructed on compliance conclusions), and placeholders for appointee name, start date, and signatures.`;

    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}

export async function generateDocument(
  type: DocumentType,
  business: { name: string; industry: string },
  profile: BusinessProfile,
  risk: RiskScoreResult
): Promise<string> {
  const prompt = buildPrompt(type, business, profile, risk);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content returned from document generation.");
  }

  // Always append a disclaimer — this is generated guidance, not certified legal advice.
  const disclaimer = `\n\n---\n*This document was generated based on your business profile and general NDPA/GAID requirements. It is a compliance starting point, not a substitute for review by a licensed Data Protection Compliance Organisation (DPCO) or legal counsel before relying on it for regulatory filings.*`;

  return textBlock.text + disclaimer;
}
