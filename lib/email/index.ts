export { sendEmail } from "@/lib/email/service";
export * from "@/lib/email/hooks";
export * from "@/lib/email/types";
export * from "@/lib/email/queries";
export * from "@/lib/email/registry";
export {
  EMAIL_TEMPLATE_LABELS,
  ADMIN_SENDABLE_TEMPLATES,
  resolveTemplateDepartment,
  getTemplateCommunicationClassLabel,
  COMMUNICATION_CLASS_LABELS,
} from "@/lib/email/templates/catalog";
