import { NextResponse } from "next/server";

import { requireClient } from "@/lib/auth/guards";
import { uploadAvatarFile } from "@/lib/documents/storage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ctx = await requireClient();
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Select a photo to upload." },
        { status: 400 },
      );
    }

    const upload = await uploadAvatarFile({
      userId: ctx.user.id,
      file,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: upload.publicUrl })
      .eq("id", ctx.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: "Profile photo updated.",
      avatarUrl: upload.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload profile photo.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const ctx = await requireClient();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", ctx.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: "Profile photo removed." });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove profile photo.",
      },
      { status: 500 },
    );
  }
}
