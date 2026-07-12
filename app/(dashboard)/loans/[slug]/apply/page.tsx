import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LoanApplicationWizard } from "@/components/loan-application";
import { getSessionUser } from "@/lib/auth/actions";
import { getProfile } from "@/lib/auth/profile";
import { fetchLoanProductBySlugForClient } from "@/lib/loans/server-queries";
import { getCompanyContext } from "@/lib/company/server";

type ApplyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const [{ branding }, { slug }] = await Promise.all([
    getCompanyContext(),
    params,
  ]);
  const product = await fetchLoanProductBySlugForClient(slug);

  if (!product) {
    return { title: "Get Pre-Qualified" };
  }

  return {
    title: `Get Pre-Qualified for ${product.name}`,
    description: `Start your ${product.name} mortgage application with ${branding.institutionName}.`,
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const product = await fetchLoanProductBySlugForClient(slug);

  if (!product) {
    notFound();
  }

  const user = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <LoanApplicationWizard
      product={product}
      profile={profile}
      email={user?.email ?? ""}
    />
  );
}
