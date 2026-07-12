import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import { BRAND_DISPLAY_NAME, getAppOrigin, getSupportEmailAddress, getWebsiteDomain, getWebsiteUrl, ORBIT_MORTGAGE_TAGLINE } from "@/lib/email/config";
import { isHtmlContent, sanitizeEmailCompositionHtml } from "@/lib/email/sanitize-html";
import type { EmailStatusTone } from "@/lib/email/types";
import { emailColors, emailFonts } from "@/lib/email/react/tokens";
import type {
  EmailDetailRow,
  EmailProgressStep,
  EmailStaffSignature,
  EmailBrandingContext,
} from "@/lib/email/react/types";

function toneStyles(tone: EmailStatusTone = "neutral") {
  switch (tone) {
    case "approved":
      return { color: emailColors.success, bg: emailColors.successBg };
    case "pending":
      return { color: emailColors.pending, bg: emailColors.pendingBg };
    case "rejected":
      return { color: emailColors.rejected, bg: emailColors.rejectedBg };
    default:
      return { color: emailColors.primary, bg: "#EFF6FF" };
  }
}

function resolveLogoOrigin(branding?: EmailBrandingContext): string {
  const domain = branding?.websiteDomain?.trim();
  if (!domain) {
    return getAppOrigin();
  }
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return domain.replace(/\/$/, "");
  }
  return `https://${domain}`;
}

export function EmailLogoMark({ branding }: { branding?: EmailBrandingContext }) {
  if (branding?.logoUrl) {
    const logoSrc = branding.logoUrl.startsWith("http")
      ? branding.logoUrl
      : `${resolveLogoOrigin(branding)}${branding.logoUrl.startsWith("/") ? branding.logoUrl : `/${branding.logoUrl}`}`;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt=""
        width={44}
        height={44}
        style={{
          display: "block",
          width: 44,
          height: 44,
          objectFit: "contain",
        }}
      />
    );
  }

  const markColor = branding?.primaryColor ?? emailColors.markDark;
  const markLight = branding?.primaryColor
    ? `${branding.primaryColor}99`
    : emailColors.markLight;

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width={44}
      style={{ width: 44, height: 44, borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td
            width={26}
            height={26}
            style={{
              width: 26,
              height: 26,
              backgroundColor: markColor,
              borderRadius: 3,
              fontSize: 0,
              lineHeight: 0,
            }}
          >
            &nbsp;
          </td>
          <td width={18} style={{ width: 18, fontSize: 0, lineHeight: 0 }}>
            &nbsp;
          </td>
        </tr>
        <tr>
          <td height={18} style={{ height: 18, fontSize: 0, lineHeight: 0 }}>
            &nbsp;
          </td>
          <td
            width={26}
            height={26}
            style={{
              width: 26,
              height: 26,
              backgroundColor: markLight,
              borderRadius: 3,
              fontSize: 0,
              lineHeight: 0,
            }}
          >
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** @deprecated Use EmailLogoMark */
export const OrbitLogoMark = EmailLogoMark;

export function EmailBrandHeader({
  showPathward = true,
  minimal = false,
  branding,
}: {
  showPathward?: boolean;
  minimal?: boolean;
  branding?: EmailBrandingContext;
}) {
  const institutionName = branding?.institutionName ?? BRAND_DISPLAY_NAME;
  const tagline = branding?.tagline ?? ORBIT_MORTGAGE_TAGLINE;
  const bankPartner = branding?.bankPartnerName ?? "Pathward National Bank";

  return (
    <Section style={{ backgroundColor: emailColors.headerBg, padding: minimal ? "28px 32px 20px" : "24px 32px 20px" }}>
      <Row>
        <Column style={{ verticalAlign: "middle" }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
            <tbody>
              <tr>
                <td style={{ paddingRight: 12, verticalAlign: "middle" }}>
                  <EmailLogoMark branding={branding} />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontFamily: emailFonts.sans,
                      fontSize: 20,
                      fontWeight: 700,
                      color: emailColors.text,
                      letterSpacing: "-0.03em",
                      lineHeight: "24px",
                    }}
                  >
                    {institutionName}
                  </Text>
                  {!minimal ? (
                    <Text
                      style={{
                        margin: "2px 0 0",
                        fontFamily: emailFonts.sans,
                        fontSize: 11,
                        color: emailColors.muted,
                        lineHeight: "16px",
                      }}
                    >
                      {tagline}
                    </Text>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </Column>
        {showPathward ? (
          <Column align="right" style={{ verticalAlign: "middle" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: emailFonts.sans,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: emailColors.muted,
                textAlign: "right",
              }}
            >
              Powered by {bankPartner}
            </Text>
          </Column>
        ) : null}
      </Row>
    </Section>
  );
}

export function EmailMetaRow({
  departmentName,
  referenceNumber,
  dateLabel,
  badge,
  tone = "neutral",
}: {
  departmentName: string;
  referenceNumber?: string;
  dateLabel?: string;
  badge?: string;
  tone?: EmailStatusTone;
}) {
  const badgeStyle = toneStyles(tone);

  return (
    <Section style={{ padding: "0 32px 24px" }}>
      <Row>
        <Column style={{ width: "68%" }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
            <tbody>
              <tr>
                <td
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#EFF6FF",
                    textAlign: "center",
                    verticalAlign: "middle",
                    paddingRight: 12,
                  }}
                >
                  <Text style={{ margin: 0, fontSize: 18, lineHeight: "44px" }}>🏛</Text>
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "20px" }}>
                    <strong style={{ color: emailColors.text }}>Department:</strong> {departmentName}
                  </Text>
                  {referenceNumber ? (
                    <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "20px" }}>
                      <strong style={{ color: emailColors.text }}>Reference:</strong> {referenceNumber}
                    </Text>
                  ) : null}
                  {dateLabel ? (
                    <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "20px" }}>
                      <strong style={{ color: emailColors.text }}>Date:</strong> {dateLabel}
                    </Text>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </Column>
        {badge ? (
          <Column align="right" style={{ verticalAlign: "top" }}>
            <Text
              style={{
                margin: "0 0 4px",
                fontFamily: emailFonts.sans,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: emailColors.muted,
                textAlign: "right",
              }}
            >
              Status
            </Text>
            <Text
              style={{
                margin: 0,
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: 999,
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.color,
                fontFamily: emailFonts.sans,
                fontSize: 13,
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              ✓ {badge}
            </Text>
          </Column>
        ) : null}
      </Row>
    </Section>
  );
}

export function EmailInfoGrid({ rows, title = "Mortgage Information" }: { rows: EmailDetailRow[]; title?: string }) {
  if (!rows.length) return null;

  return (
    <Section style={{ padding: "0 32px 24px" }}>
      <Text
        style={{
          margin: "0 0 12px",
          fontFamily: emailFonts.sans,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: emailColors.primary,
        }}
      >
        {title}
      </Text>
      <Section
        style={{
          border: `1px solid ${emailColors.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {rows.map((row, index) => (
          <Row
            key={`${row.label}-${index}`}
            style={{
              backgroundColor: index % 2 === 0 ? "#FFFFFF" : emailColors.footerBg,
              borderTop: index === 0 ? "none" : `1px solid ${emailColors.border}`,
            }}
          >
            <Column style={{ width: "50%", padding: "14px 16px" }}>
              <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted }}>
                {row.label}
              </Text>
            </Column>
            <Column style={{ width: "50%", padding: "14px 16px" }}>
              <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 14, fontWeight: 600, color: emailColors.text }}>
                {row.value}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>
    </Section>
  );
}

export function EmailProgressTimeline({ steps }: { steps: EmailProgressStep[] }) {
  if (!steps.length) return null;

  return (
    <Section style={{ padding: "0 32px 28px" }}>
      <Text
        style={{
          margin: "0 0 16px",
          fontFamily: emailFonts.sans,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: emailColors.primary,
        }}
      >
        Mortgage Progress
      </Text>
      <Row>
        {steps.map((step, index) => (
          <Column key={step.label} style={{ width: `${100 / steps.length}%`, textAlign: "center" }}>
            <Text
              style={{
                margin: "0 auto 8px",
                width: 28,
                height: 28,
                lineHeight: "28px",
                borderRadius: 14,
                backgroundColor: step.state === "complete" ? emailColors.success : step.state === "current" ? emailColors.primary : "#E2E8F0",
                color: step.state === "pending" ? emailColors.muted : "#FFFFFF",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {step.state === "complete" ? "✓" : index + 1}
            </Text>
            <Text style={{ margin: "0 0 4px", fontFamily: emailFonts.sans, fontSize: 12, fontWeight: 700, color: emailColors.text }}>
              {step.label}
            </Text>
            <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 11, color: emailColors.muted }}>
              {step.status}
            </Text>
            {step.date ? (
              <Text style={{ margin: "2px 0 0", fontFamily: emailFonts.sans, fontSize: 10, color: emailColors.muted }}>
                {step.date}
              </Text>
            ) : null}
          </Column>
        ))}
      </Row>
    </Section>
  );
}

export function EmailCtaBlock({
  label,
  url,
  hint,
}: {
  label?: string;
  url?: string;
  hint?: string;
}) {
  if (!label || !url) return null;

  return (
    <Section style={{ padding: "0 32px 28px", textAlign: "center" }}>
      <Button
        href={url}
        style={{
          backgroundColor: emailColors.primary,
          color: "#FFFFFF",
          fontFamily: emailFonts.sans,
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 10,
          padding: "15px 32px",
          textDecoration: "none",
        }}
      >
        {label}
      </Button>
      {hint ? (
        <Text style={{ margin: "14px 0 0", fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "18px" }}>
          {hint}
        </Text>
      ) : null}
    </Section>
  );
}

export function EmailContactSection({
  department,
  email,
  branding,
}: {
  department: string;
  email: string;
  branding?: EmailBrandingContext;
}) {
  const officeHours = branding?.officeHours ?? "Mon – Fri: 8:00 AM – 6:00 PM EST";
  const supportPhone = branding?.supportPhone ?? "(313) 555-0189";

  return (
    <Section style={{ padding: "0 32px 28px" }}>
      <Row>
        <Column style={{ width: "50%", paddingRight: 8 }}>
          <Text style={{ margin: "0 0 6px", fontFamily: emailFonts.sans, fontSize: 13, fontWeight: 700, color: emailColors.text }}>
            Questions?
          </Text>
          <Text style={{ margin: "0 0 4px", fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "18px" }}>
            Contact your {department}
          </Text>
          <Link href={`mailto:${email}`} style={{ fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.primary, textDecoration: "none" }}>
            {email}
          </Link>
        </Column>
        <Column style={{ width: "50%", paddingLeft: 8 }}>
          <Text style={{ margin: "0 0 6px", fontFamily: emailFonts.sans, fontSize: 13, fontWeight: 700, color: emailColors.text }}>
            Office Hours
          </Text>
          <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted, lineHeight: "18px" }}>
            {officeHours}
            <br />
            {supportPhone}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

export function EmailSignatureBlock({ staff }: { staff: EmailStaffSignature }) {
  return (
    <Section style={{ padding: "0 32px 28px" }}>
      <Hr style={{ borderColor: emailColors.border, margin: "0 0 20px" }} />
      <Text style={{ margin: "0 0 4px", fontFamily: emailFonts.sans, fontSize: 14, fontWeight: 700, color: emailColors.text }}>
        {staff.name}
      </Text>
      <Text style={{ margin: "0 0 2px", fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted }}>
        {staff.title}
      </Text>
      <Text style={{ margin: "0 0 2px", fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted }}>
        {staff.department}
      </Text>
      <Link href={`mailto:${staff.email}`} style={{ fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.primary, textDecoration: "none" }}>
        {staff.email}
      </Link>
    </Section>
  );
}

export function EmailFooter({ branding }: { branding?: EmailBrandingContext }) {
  const supportEmail = branding?.supportEmail ?? getSupportEmailAddress();
  const websiteDomain = branding?.websiteDomain ?? getWebsiteDomain();
  const institutionName = branding?.institutionName ?? BRAND_DISPLAY_NAME;
  const bankPartner = branding?.bankPartnerName ?? "Pathward National Bank";
  const addressLine = branding?.addressLine;
  const websiteUrl = websiteDomain.startsWith("http")
    ? websiteDomain
    : getWebsiteUrl();

  return (
    <Section style={{ backgroundColor: emailColors.footerBg, padding: "28px 32px", borderTop: `1px solid ${emailColors.border}` }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: "0 auto 16px" }}>
        <tbody>
          <tr>
            <td style={{ paddingRight: 10, verticalAlign: "middle" }}>
              <EmailLogoMark branding={branding} />
            </td>
            <td style={{ verticalAlign: "middle" }}>
              <Text style={{ margin: 0, fontFamily: emailFonts.sans, fontSize: 14, fontWeight: 700, color: emailColors.text }}>
                {institutionName}
              </Text>
              <Text style={{ margin: "2px 0 0", fontFamily: emailFonts.sans, fontSize: 11, color: emailColors.muted }}>
                Your mortgage team
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
      <Text
        style={{
          margin: "0 0 16px",
          fontFamily: emailFonts.sans,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: emailColors.muted,
          textAlign: "center",
        }}
      >
        Powered by {bankPartner}
      </Text>
      {addressLine ? (
        <Text style={{ margin: "0 0 12px", fontFamily: emailFonts.sans, fontSize: 11, color: emailColors.muted, textAlign: "center", lineHeight: "16px", whiteSpace: "pre-line" }}>
          {addressLine}
        </Text>
      ) : null}
      <Row>
        <Column align="center">
          <Link href={`mailto:${supportEmail}`} style={{ fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.primary, textDecoration: "none" }}>
            {supportEmail}
          </Link>
        </Column>
        <Column align="center">
          <Link href={websiteUrl} style={{ fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.primary, textDecoration: "none" }}>
            {websiteDomain.startsWith("www.") ? websiteDomain : `www.${websiteDomain}`}
          </Link>
        </Column>
        {branding?.supportPhone ? (
          <Column align="center">
            <Text style={{ fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted }}>
              {branding.supportPhone}
            </Text>
          </Column>
        ) : null}
      </Row>
      <Text style={{ margin: "16px 0 0", fontFamily: emailFonts.sans, fontSize: 11, color: emailColors.muted, textAlign: "center", lineHeight: "16px" }}>
        {`This email was sent on behalf of ${institutionName}. For help, visit your Support page in your dashboard.`}
      </Text>
    </Section>
  );
}

export function EmailShell({
  preview,
  accentBar = true,
  children,
}: {
  preview: string;
  accentBar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: emailColors.background, fontFamily: emailFonts.sans }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
          <Section
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${emailColors.border}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
            }}
          >
            {accentBar ? (
              <Section style={{ height: 4, backgroundColor: emailColors.primary, lineHeight: "4px", fontSize: 0 }}>
                &nbsp;
              </Section>
            ) : null}
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailBodyContent({
  headline,
  body,
}: {
  headline: string;
  body: string;
}) {
  const richBody = isHtmlContent(body)
    ? sanitizeEmailCompositionHtml(body)
    : null;
  const paragraphs = richBody ? [] : body.split(/\n{2,}/).filter(Boolean);

  return (
    <Section style={{ padding: "0 32px 24px" }}>
      <Heading
        as="h1"
        style={{
          margin: "0 0 16px",
          fontFamily: emailFonts.sans,
          fontSize: 28,
          lineHeight: "34px",
          fontWeight: 700,
          color: emailColors.navy,
          letterSpacing: "-0.03em",
        }}
      >
        {headline}
      </Heading>
      {richBody ? (
        <div
          dangerouslySetInnerHTML={{ __html: richBody }}
          style={{
            margin: 0,
            fontFamily: emailFonts.sans,
            fontSize: 15,
            lineHeight: "24px",
            color: emailColors.text,
          }}
        />
      ) : (
        paragraphs.map((paragraph) => (
          <Text
            key={paragraph.slice(0, 24)}
            style={{
              margin: "0 0 14px",
              fontFamily: emailFonts.sans,
              fontSize: 15,
              lineHeight: "24px",
              color: emailColors.text,
            }}
          >
            {paragraph}
          </Text>
        ))
      )}
    </Section>
  );
}
