"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const EMAIL_ASSETS_BUCKET = "email-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type UploadEmailCompositionImageState = {
  url?: string;
  error?: string;
};

export async function uploadEmailCompositionImageAction(
  formData: FormData,
): Promise<UploadEmailCompositionImageState> {
  const ctx = await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Select an image to upload." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Only JPG, PNG, GIF, and WebP images are supported." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "png";
  const storagePath = `compositions/${ctx.user.id}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createServiceRoleClient();

  const { error } = await supabase.storage
    .from(EMAIL_ASSETS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: false,
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage
    .from(EMAIL_ASSETS_BUCKET)
    .getPublicUrl(storagePath);

  return { url: data.publicUrl };
}
