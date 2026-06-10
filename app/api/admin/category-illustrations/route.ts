import { NextResponse } from "next/server";

import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireRoles } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/auth/roles";
import { LOAN_PRODUCT_CATEGORIES } from "@/lib/loans/category-config";
import { createClient } from "@/lib/supabase/server";
import type { LoanProductCategory } from "@/types/loans";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  try {
    const ctx = await requireRoles([USER_ROLES.admin, USER_ROLES.superAdmin]);
    if (!hasAdminPermission(ctx.role, "products:manage")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const formData = await request.formData();
    const category = formData.get("category") as LoanProductCategory | null;
    const file = formData.get("illustration");

    if (!category || !LOAN_PRODUCT_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Select an image file to upload." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Upload PNG, JPEG, WebP, or SVG images only." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${category}-${Date.now()}.${extension}`;
    const supabase = await createClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("category-illustrations")
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("category-illustrations")
      .getPublicUrl(path);

    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json(
        { error: "Upload succeeded but public URL could not be generated." },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("loan_product_category_meta")
      .update({
        illustration_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("category", category);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: "Illustration uploaded.",
      url: publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload illustration.",
      },
      { status: 500 },
    );
  }
}
