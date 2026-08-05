const VERIFIED_DOMAIN_EMAIL = "team@primrosecrm.com";
const BRAND_NAME = "Primrose Review";

export function buildCounselorFrom(
  counselorName?: string | null,
  counselorEmail?: string | null,
): { from: string; reply_to?: string } {
  const name = (counselorName ?? "").trim();
  const from = name
    ? `${name} via ${BRAND_NAME} <${VERIFIED_DOMAIN_EMAIL}>`
    : `The ${BRAND_NAME} <${VERIFIED_DOMAIN_EMAIL}>`;

  const email = (counselorEmail ?? "").trim();
  return email ? { from, reply_to: email } : { from };
}
