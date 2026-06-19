import { createClient } from "@/lib/supabase/server";

export const APPLICATION_DOCUMENTS_BUCKET = "application-documents";
export const AVATARS_BUCKET = "avatars";
export const REPAYMENT_PROOFS_BUCKET = "repayment-proofs";

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadApplicationDocumentFile(input: {
  userId: string;
  applicationId: string;
  requirementId: string;
  file: File;
}): Promise<{ storagePath: string; error?: string }> {
  if (input.file.size > 10 * 1024 * 1024) {
    return { storagePath: "", error: "File must be 10 MB or smaller." };
  }

  const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const storagePath = `${input.userId}/${input.applicationId}/${input.requirementId}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(APPLICATION_DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: input.file.type || "application/octet-stream",
    });

  if (error) {
    return { storagePath: "", error: error.message };
  }

  return { storagePath };
}

export async function uploadAvatarFile(input: {
  userId: string;
  file: File;
}): Promise<{ publicUrl: string; error?: string }> {
  if (!ALLOWED_AVATAR_TYPES.has(input.file.type)) {
    return { publicUrl: "", error: "Use a JPG, PNG, or WebP image." };
  }

  if (input.file.size > AVATAR_MAX_FILE_SIZE) {
    return { publicUrl: "", error: "Photo must be 5 MB or smaller." };
  }

  const extension = input.file.type === "image/png" ? "png" : input.file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${input.userId}/avatar.${extension}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: input.file.type,
    });

  if (error) {
    return { publicUrl: "", error: error.message };
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: `${data.publicUrl}?v=${Date.now()}` };
}

export async function createSignedDocumentUrl(
  bucket: string,
  storagePath: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function resolveStorageDownloadUrl(
  bucket: string,
  fileUrl: string | null | undefined,
): Promise<string | null> {
  if (!fileUrl) {
    return null;
  }

  if (fileUrl.startsWith("http")) {
    const path = extractStoragePathFromUrl(fileUrl, bucket);
    if (path) {
      return createSignedDocumentUrl(bucket, path);
    }
    return fileUrl;
  }

  return createSignedDocumentUrl(bucket, fileUrl);
}

export function extractStoragePathFromUrl(
  url: string,
  bucket: string,
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const signedMarker = `/storage/v1/object/sign/${bucket}/`;
  const privateMarker = `/storage/v1/object/${bucket}/`;

  if (url.includes(marker)) {
    return url.split(marker)[1]?.split("?")[0] ?? null;
  }
  if (url.includes(signedMarker)) {
    return url.split(signedMarker)[1]?.split("?")[0] ?? null;
  }
  if (url.includes(privateMarker)) {
    return url.split(privateMarker)[1]?.split("?")[0] ?? null;
  }

  return null;
}

export function isAllowedDocumentFile(file: File): boolean {
  if (ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png", "doc", "docx", "webp"].includes(
    extension ?? "",
  );
}
