"use server";

import { revalidatePath } from "next/cache";

import { profileCompletionSchema } from "@/lib/auth/schemas";
import { validateCityForState } from "@/lib/auth/validate-city";
import { uploadAvatarFile } from "@/lib/documents/storage";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  error?: string;
  success?: string;
  avatarUrl?: string;
};

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileCompletionSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
    zipCode: formData.get("zipCode"),
    dateOfBirth: formData.get("dateOfBirth"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const cityError = validateCityForState(parsed.data.state, parsed.data.city);
  if (cityError) {
    return { error: cityError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const middleName = formData.get("middleName")?.toString().trim().toUpperCase();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      middle_name: middleName || null,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      state: parsed.data.state,
      city: parsed.data.city,
      address: parsed.data.address,
      zip_code: parsed.data.zipCode,
      date_of_birth: parsed.data.dateOfBirth,
      profile_status: "complete",
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: "Profile updated successfully." };
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a photo to upload." };
  }

  const upload = await uploadAvatarFile({ userId: user.id, file });
  if (upload.error) {
    return { error: upload.error };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: upload.publicUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return {
    success: "Profile photo updated.",
    avatarUrl: upload.publicUrl,
  };
}

export async function removeAvatarAction(): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: "Profile photo removed." };
}
