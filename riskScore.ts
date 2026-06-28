// src/lib/riskScore.ts
//
// DCPMI classification logic — grounded in verified NDPC Guidance Notice / GAID thresholds.
// See NDPA_FACTS.md at project root for sourcing.
//
// IMPORTANT: This is a self-assessment heuristic, not a legal determination.
// Always tell the user to confirm on the NDPC portal before paying a registration fee.

export type DcpmiTier = "NOT_DCPMI" | "OHL" | "EHL" | "UHL" | "UNKNOWN";

export interface BusinessProfile {
  industry: string;
  employeeCount: number;
  estimatedDataSubjects: number; // within a rolling 6-month period
  handlesSensitiveData: boolean;
  processesChildrensData: boolean;
  hasInternationalTransfer: boolean;
  providesCommercialIctService: boolean;
}

// Sectors the GAID designates as automatically pushing an org toward DCPMI status,
// regardless of data-subject volume.
const DESIGNATED_SECTORS = [
  "aviation",
  "communication",
  "telecom",
  "education",
  "electric power",
  "energy",
  "export",
  "import",
  "financial services",
  "fintech",
  "banking",
  "health",
  "healthcare",
  "hospitality",
  "insurance",
  "oil and gas",
  "tourism",
  "e-commerce",
  "ecommerce",
  "public service",
  "government",
];

// Sub-sectors that the Guidance Notice explicitly classifies as Ultra High Level (UHL)
// regardless of self-reported data subject count — these are the largest, highest-risk players.
const UHL_SECTORS = [
  "bank",
  "telecom",
  "insurance",
  "multinational",
  "electricity distribution",
  "oil and gas",
  "social media",
  "email app",
  "communication device manufacturer",
  "payment gateway",
];

export interface RiskScoreResult {
  isDcpmi: boolean;
  tier: DcpmiTier;
  estimatedRegistrationFeeNaira: { min: number; max: number } | null;
  triggeredReasons: string[];
  requiredActions: string[];
  recommendedDocuments: string[];
  urgency: "low" | "medium" | "high";
}

function matchesDesignatedSector(industry: string): boolean {
  const lower = industry.toLowerCase();
  return DESIGNATED_SECTORS.some((s) => lower.includes(s));
}

function matchesUhlSector(industry: string): boolean {
  const lower = industry.toLowerCase();
  return UHL_SECTORS.some((s) => lower.includes(s));
}

export function calculateRiskScore(profile: BusinessProfile): RiskScoreResult {
  const reasons: string[] = [];
  let tier: DcpmiTier = "NOT_DCPMI";

  const inDesignatedSector = matchesDesignatedSector(profile.industry);
  const inUhlSector = matchesUhlSector(profile.industry);

  // --- Determine DCPMI status ---
  // Trigger 1: data subject volume > 200 in 6 months
  if (profile.estimatedDataSubjects > 200) {
    reasons.push(
      `You report ~${profile.estimatedDataSubjects} data subjects in a 6-month period, which exceeds the 200-person DCPMI threshold.`
    );
  }

  // Trigger 2: commercial ICT services storing others' personal data
  if (profile.providesCommercialIctService) {
    reasons.push(
      "You provide commercial ICT services on devices that store other people's personal data — this independently triggers DCPMI status regardless of volume."
    );
  }

  // Trigger 3: designated sector
  if (inDesignatedSector) {
    reasons.push(
      `Your industry ("${profile.industry}") falls under an NDPC-designated sector, which independently triggers DCPMI status regardless of volume.`
    );
  }

  const isDcpmi =
    profile.estimatedDataSubjects > 200 ||
    profile.providesCommercialIctService ||
    inDesignatedSector;

  if (isDcpmi) {
    if (inUhlSector || profile.estimatedDataSubjects >= 5000) {
      tier = "UHL";
    } else if (profile.estimatedDataSubjects >= 1000) {
      tier = "EHL";
    } else {
      // covers the 200-999 band, plus designated-sector/ICT triggers with lower volume
      tier = "OHL";
    }
  } else {
    tier = "NOT_DCPMI";
  }

  // --- Fee estimate (approximate — always tell user to confirm on NDPC portal) ---
  let estimatedRegistrationFeeNaira: { min: number; max: number } | null = null;
  if (tier === "UHL") estimatedRegistrationFeeNaira = { min: 250000, max: 250000 };
  if (tier === "EHL") estimatedRegistrationFeeNaira = { min: 100000, max: 200000 };
  if (tier === "OHL") estimatedRegistrationFeeNaira = { min: 10000, max: 25000 };

  // --- Required actions, independent of tier (everyone processing personal data) ---
  const requiredActions: string[] = [
    "Maintain a Record of Processing Activities (RoPA).",
    "Publish an accessible, plain-language Privacy Policy.",
    "Establish a breach response plan that can notify the NDPC within 72 hours of awareness.",
  ];

  if (isDcpmi) {
    requiredActions.push(
      "Register with the NDPC as a Data Controller/Processor of Major Importance within 6 months of meeting the threshold.",
      "Appoint a Data Protection Officer (DPO) and publish their contact details.",
      "File a Compliance Audit Return (CAR) annually, conducted by a licensed DPCO."
    );
  } else {
    requiredActions.push(
      "Register with the NDPC as a standard data controller/processor (lighter-touch than DCPMI, still required for any org processing personal data)."
    );
  }

  if (profile.handlesSensitiveData || profile.processesChildrensData) {
    requiredActions.push(
      "Conduct a Data Privacy Impact Assessment (DPIA) given your handling of sensitive or children's data."
    );
  }

  if (profile.hasInternationalTransfer) {
    requiredActions.push(
      "Confirm a Data Processing Agreement (DPA) is in place with any cloud/SaaS provider hosting data outside Nigeria."
    );
  }

  // --- Recommended document set ---
  const recommendedDocuments = [
    "Privacy Policy",
    "Record of Processing Activities (RoPA)",
    "Breach Response Plan",
  ];
  if (isDcpmi) recommendedDocuments.push("DPO Appointment Letter");
  if (profile.handlesSensitiveData || profile.processesChildrensData) {
    recommendedDocuments.push("Data Privacy Impact Assessment (DPIA)");
  }

  // --- Urgency ---
  let urgency: "low" | "medium" | "high" = "low";
  if (isDcpmi) urgency = "high";
  else if (profile.handlesSensitiveData || profile.processesChildrensData) urgency = "medium";

  return {
    isDcpmi,
    tier,
    estimatedRegistrationFeeNaira,
    triggeredReasons: reasons,
    requiredActions,
    recommendedDocuments,
    urgency,
  };
}
