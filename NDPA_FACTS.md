# NDPA/GAID Verified Facts (sourced June 2026)

## Governing law
- Nigeria Data Protection Act (NDPA) 2023 — signed 12 June 2023
- General Application and Implementation Directive (GAID) 2025 — issued 20 March 2025, effective 19 September 2025
- GAID replaced the old NDPR 2019 framework
- Regulator: Nigeria Data Protection Commission (NDPC)

## DCPMI (Data Controller/Processor of Major Importance) thresholds
An org is a DCPMI if it meets ANY of:
1. Processes personal data of >200 data subjects within a 6-month period
2. Provides commercial ICT services on digital devices storing others' personal data
3. Operates in a designated sector: aviation, communication, education, electric power,
   export/import, financial services, health, hospitality, insurance, oil & gas, tourism,
   e-commerce, or public service

### DCPMI sub-levels (by volume/risk)
- MDP-UHL (Ultra High Level): >5,000 data subjects in 6mo, or major sectors (banks, telecoms,
  insurers, multinationals, power distributors, oil & gas, social media/email app developers,
  payment gateways). Registration fee: ₦250,000
- MDP-EHL (Extra High Level): 1,000–4,999 data subjects. Fee: ₦100,000–₦200,000 depending on volume
- MDP-OHL (Ordinary High Level): 200–999 data subjects, OR SMEs with data access, schools,
  primary health centers, vendors/agents of UHL/EHL orgs. Fee: ₦10,000–₦25,000

NOTE: fee figures vary slightly across sources (₦10k-25k for small/OHL tier) — present as
approximate in-app and recommend confirming on NDPC portal before payment.

Even non-DCPMI orgs that process any personal data should still register at start of operations
and renew annually (per NDPC guidance — lighter touch than full DCPMI registration).

## Registration
- Must register within 6 months of becoming a DCPMI
- Done online via NDPC portal
- Requires: CAC certificate, DPO appointment letter, valid ID of a director,
  qualifications of ≥2 staff, description of data processed/data subject volume/purposes
- Original deadline 30 June 2024 / extended to 31 Oct 2024 — now ongoing with late fee
- 2026 = NDPC's stated enforcement year (shifting from education to enforcement)

## Compliance Audit Returns (CAR)
- DCPMIs must file CAR annually, not later than 31 March each year
  (2025 CAR deadline was extended to 30 May 2026 — confirm current year deadline live)
- Must be conducted by a licensed Data Protection Compliance Organisation (DPCO)
- NDPC issues a CAR Certificate on successful filing

## DPO (Data Protection Officer)
- DCPMIs must appoint a DPO (staff member or external contract)
- Must have data protection law/practice knowledge; independent; reports to senior management
- Contact details must be public and given to NDPC
- Must submit semi-annual data protection reports to management

## Breach notification
- Notify NDPC within 72 hours of becoming aware of a breach that poses risk/high risk
  (NDPA s.40; GAID Art. 33) — clock starts at awareness, not at breach occurrence
- Notify affected data subjects "without undue delay" if high risk to their rights
- Must include: nature of breach, categories/approx number of data subjects & records,
  DPO contact details, likely consequences, mitigation steps taken
- Can file an incomplete initial report within 72hrs and supplement later
- Must maintain an internal breach register regardless of whether NDPC was notified
- Processor → must notify Controller immediately upon becoming aware (GAID Art. 33(2))

## DPIA (Data Privacy Impact Assessment)
- Required for high-risk processing: large-scale profiling, biometric data, automated
  decision-making with significant effects, sensitive data, children's data, vulnerable
  data subjects
- NDPC may require prior consultation for high-risk DPIAs
- GAID provides a DPIA template (Schedule) and a "Data Subject Vulnerability Index"

## Penalties
- DCPMI: up to ₦10,000,000 OR 2% of prior year's annual gross revenue, whichever is GREATER
- Non-major orgs: up to ₦2,000,000 OR 2% of gross revenue, whichever is greater
- Possible imprisonment up to 1 year for non-compliance with NDPC orders
- Data subjects can claim civil damages separately
- Real enforcement precedent: ₦766.2M fine vs Multichoice Nigeria; $220M vs Meta

## Cross-border data transfer
- Allowed where destination has "adequate" protection (binding law, contract clauses,
  code of conduct, etc.) under NDPC supervision
- If not adequate: allowed via informed consent, contract necessity, or other listed exceptions
- Relevant trigger question for app: "Do you use any cloud tools/providers based outside Nigeria?"
  (e.g., Google Workspace, AWS, etc.) — most SMEs will answer yes, need a DPA with provider

## Core data protection principles (GAID-restated)
- Lawfulness, fairness, transparency
- Purpose limitation (specific, explicit, legitimate purpose with consent)
- Data minimization (adequate, relevant, limited to necessary)
- Storage limitation (only as long as reasonably needed)
- Security (protect against theft, cyberattack, fire, unauthorized disclosure, etc.)
- Accountability (must DEMONSTRATE compliance, not just claim it)

## Lawful bases for processing (6 total under NDPA)
Consent, contractual obligation, legal obligation, vital interest, public interest,
legitimate interest (new addition vs old NDPR)

## Sensitive personal data
Special category requiring stricter grounds (health, biometric, etc. — typical GDPR-style list)

## Children's data
- "Child" = under 18
- Constitutional right to privacy extends to children, subject to parental/guardian supervision

---
SOURCES: globallawexperts.com, tnp.com.ng, afriwise.com, iclg.com, multilaw.com, cookieyes.com,
otllaw.com, regulations.ai, secureprivacy.ai, nigeriadataprotection.com — accessed June 2026.
DISCLAIMER FOR APP: This is regulatory guidance synthesis, not legal advice. Generated documents
should carry a disclaimer and ideally get a one-time human legal review before heavy commercial use.
