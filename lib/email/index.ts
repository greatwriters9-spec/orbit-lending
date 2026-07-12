export { sendEmail } from "@/lib/email/service";
export * from "@/lib/email/hooks";
export * from "@/lib/email/types";
export * from "@/lib/email/queries";
export * from "@/lib/email/registry";
export {
  getEmailSender,
  getEmailSenderByDepartment,
  getDepartmentContactEmail,
  resolveOutgoingEmailEvent,
} from "@/lib/email/emailRouter";
export {
  EMAIL_TEMPLATE_LABELS,
  ADMIN_SENDABLE_TEMPLATES,
  getTemplateCommunicationClassLabel,
  COMMUNICATION_CLASS_LABELS,
} from "@/lib/email/templates/catalog-labels";
export { resolveTemplateDepartment } from "@/lib/email/registry";
