import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ categoryKey: string }>;
};

export default async function AdminProductCategoryEditRedirect({
  params,
}: PageProps) {
  const { categoryKey } = await params;
  redirect(`/admin/loan-products/categories/${categoryKey}/edit`);
}
