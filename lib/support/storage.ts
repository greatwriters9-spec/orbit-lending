import { createClient } from "@/lib/supabase/server";
import {
  SUPPORT_ATTACHMENTS_BUCKET,
  SUPPORT_MAX_ATTACHMENT_SIZE,
} from "@/lib/support/constants";

export async function uploadSupportAttachment(input: {
  userId: string;
  ticketId: string;
  file: File;
}): Promise<{ storagePath: string; error?: string }> {
  if (input.file.size > SUPPORT_MAX_ATTACHMENT_SIZE) {
    return { storagePath: "", error: "Attachment must be 10 MB or smaller." };
  }

  const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const storagePath = `${input.userId}/${input.ticketId}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(SUPPORT_ATTACHMENTS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: false,
      contentType: input.file.type || "application/octet-stream",
    });

  if (error) {
    return { storagePath: "", error: error.message };
  }

  return { storagePath };
}

export async function createSupportAttachmentSignedUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(SUPPORT_ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
