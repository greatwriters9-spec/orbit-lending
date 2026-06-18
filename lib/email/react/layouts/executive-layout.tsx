import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailBodyContent,
  EmailBrandHeader,
  EmailFooter,
  EmailShell,
  EmailSignatureBlock,
} from "@/lib/email/react/components/shared";
import { emailColors, emailFonts } from "@/lib/email/react/tokens";
import type { EmailTemplateContent } from "@/lib/email/react/types";

export function ExecutiveLayout({
  preview,
  content,
}: {
  preview: string;
  content: EmailTemplateContent;
}) {
  const signature = content.executiveSignature ?? content.staff;

  return (
    <EmailShell preview={preview} accentBar={false}>
      <EmailBrandHeader showPathward minimal />
      <Section style={{ padding: "8px 32px 20px" }}>
        <Text
          style={{
            margin: 0,
            fontFamily: emailFonts.sans,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: emailColors.muted,
          }}
        >
          Executive Office
        </Text>
        {content.referenceNumber ? (
          <Text style={{ margin: "8px 0 0", fontFamily: emailFonts.sans, fontSize: 12, color: emailColors.muted }}>
            Reference: {content.referenceNumber}
          </Text>
        ) : null}
      </Section>
      <Hr style={{ borderColor: emailColors.border, margin: "0 32px" }} />
      {content.badge ? (
        <Section style={{ padding: "20px 32px 0" }}>
          <Text
            style={{
              margin: 0,
              display: "inline-block",
              padding: "6px 12px",
              border: `1px solid ${emailColors.border}`,
              borderRadius: 6,
              fontFamily: emailFonts.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: emailColors.navy,
              backgroundColor: "#FFFFFF",
            }}
          >
            Official Notice — {content.badge}
          </Text>
        </Section>
      ) : null}
      <EmailBodyContent headline={content.headline} body={content.body} />
      {content.detailRows?.length ? (
        <Section style={{ padding: "0 32px 24px" }}>
          {content.detailRows.map((row) => (
            <Text
              key={row.label}
              style={{
                margin: "0 0 8px",
                fontFamily: emailFonts.sans,
                fontSize: 13,
                color: emailColors.text,
                lineHeight: "20px",
              }}
            >
              <strong>{row.label}:</strong> {row.value}
            </Text>
          ))}
        </Section>
      ) : null}
      {signature ? <EmailSignatureBlock staff={signature} /> : null}
      <EmailFooter />
    </EmailShell>
  );
}
