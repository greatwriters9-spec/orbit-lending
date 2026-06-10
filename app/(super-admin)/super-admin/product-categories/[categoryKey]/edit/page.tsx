import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ categoryKey: string }>;
};

export default async function SuperAdminProductCategoryEditRedirect({
  params,
}: PageProps) {
  const { categoryKey } = await params;
  redirect(`/super-admin/loan-products/categories/${categoryKey}/edit`);
}
