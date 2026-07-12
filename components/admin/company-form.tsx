"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveCompanyAction, setCompanyStatusAction } from "@/lib/company/actions";
import type { CompanyRecord } from "@/types/company";

const inputClassName =
  "h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15";

type CompanyFormProps = {
  company?: CompanyRecord;
};

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    companyName: company?.companyName ?? "",
    slug: company?.slug ?? "",
    domain: company?.domain ?? "",
    alternateDomains: company?.alternateDomains.join(", ") ?? "",
    logo: company?.logo ?? "",
    favicon: company?.favicon ?? "",
    primaryColor: company?.primaryColor ?? "#0f2d78",
    secondaryColor: company?.secondaryColor ?? "#1e4db7",
    accentColor: company?.accentColor ?? "#6b7280",
    backgroundColor: company?.backgroundColor ?? "#ffffff",
    headquartersAddress: company?.headquartersAddress ?? "",
    businessAddress: company?.businessAddress ?? "",
    supportEmail: company?.supportEmail ?? "",
    generalEmail: company?.generalEmail ?? "",
    phoneNumber: company?.phoneNumber ?? "",
    secondaryPhone: company?.secondaryPhone ?? "",
    businessHours: company?.businessHours ?? "",
    bankingPartner: company?.bankingPartner ?? "Pathward National Bank",
    website: company?.website ?? "",
    tagline: company?.tagline ?? "",
    heroTitle: company?.heroTitle ?? "",
    heroSubtitle: company?.heroSubtitle ?? "",
    heroButtonText: company?.heroButtonText ?? "Get Pre-Qualified",
    heroBackground: company?.heroBackground ?? "",
    aboutUs: company?.aboutUs ?? "",
    mission: company?.mission ?? "",
    vision: company?.vision ?? "",
    whyChooseUs: company?.whyChooseUs ?? "",
    footerText: company?.footerText ?? "",
    copyrightText: company?.copyrightText ?? "",
    facebook: company?.facebook ?? "",
    instagram: company?.instagram ?? "",
    linkedin: company?.linkedin ?? "",
    twitter: company?.twitter ?? "",
    tiktok: company?.tiktok ?? "",
    youtube: company?.youtube ?? "",
    threads: company?.threads ?? "",
    telegram: company?.telegram ?? "",
    whatsapp: company?.whatsapp ?? "",
    companyStatus: company?.companyStatus ?? "active",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveCompanyAction({
        id: company?.id,
        companyName: form.companyName,
        slug: form.slug,
        domain: form.domain,
        alternateDomains: form.alternateDomains
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        logo: form.logo || null,
        favicon: form.favicon || null,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        headquartersAddress: form.headquartersAddress || null,
        businessAddress: form.businessAddress || null,
        supportEmail: form.supportEmail || null,
        generalEmail: form.generalEmail || null,
        phoneNumber: form.phoneNumber || null,
        secondaryPhone: form.secondaryPhone || null,
        businessHours: form.businessHours || null,
        bankingPartner: form.bankingPartner || null,
        website: form.website || null,
        tagline: form.tagline || null,
        heroTitle: form.heroTitle || null,
        heroSubtitle: form.heroSubtitle || null,
        heroButtonText: form.heroButtonText || null,
        heroBackground: form.heroBackground || null,
        aboutUs: form.aboutUs || null,
        mission: form.mission || null,
        vision: form.vision || null,
        whyChooseUs: form.whyChooseUs || null,
        footerText: form.footerText || null,
        copyrightText: form.copyrightText || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        linkedin: form.linkedin || null,
        twitter: form.twitter || null,
        tiktok: form.tiktok || null,
        youtube: form.youtube || null,
        threads: form.threads || null,
        telegram: form.telegram || null,
        whatsapp: form.whatsapp || null,
        companyStatus: form.companyStatus as "active" | "inactive",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success ?? "Saved.");
      if (!company?.id && result.companyId) {
        router.push(`/super-admin/companies/${result.companyId}`);
      } else {
        router.refresh();
      }
    });
  };

  const toggleStatus = () => {
    if (!company?.id) return;
    const nextStatus = company.companyStatus === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setCompanyStatusAction(company.id, nextStatus);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.success ?? "Updated.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-brand-success/20 bg-brand-success/5 px-4 py-3 text-sm text-brand-success">
          {success}
        </p>
      ) : null}

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Company Identity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-brand-navy">Company Name</span>
            <input className={inputClassName} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-brand-navy">Slug</span>
            <input className={inputClassName} value={form.slug} onChange={(e) => update("slug", e.target.value)} required />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-brand-navy">Primary Domain</span>
            <input className={inputClassName} value={form.domain} onChange={(e) => update("domain", e.target.value)} required />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-brand-navy">Alternate Domains (comma separated)</span>
            <input className={inputClassName} value={form.alternateDomains} onChange={(e) => update("alternateDomains", e.target.value)} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-brand-navy">Logo URL</span>
            <input className={inputClassName} value={form.logo} onChange={(e) => update("logo", e.target.value)} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-brand-navy">Favicon URL</span>
            <input className={inputClassName} value={form.favicon} onChange={(e) => update("favicon", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Brand Colors</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {(["primaryColor", "secondaryColor", "accentColor", "backgroundColor"] as const).map((key) => (
            <label key={key} className="space-y-2 text-sm">
              <span className="font-medium capitalize text-brand-navy">{key.replace("Color", " Color")}</span>
              <input type="color" className="h-11 w-full rounded-xl border border-brand-border" value={form[key]} onChange={(e) => update(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Contact & Business</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Support Email</span><input className={inputClassName} value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">General Email</span><input className={inputClassName} value={form.generalEmail} onChange={(e) => update("generalEmail", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Phone</span><input className={inputClassName} value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Secondary Phone</span><input className={inputClassName} value={form.secondaryPhone} onChange={(e) => update("secondaryPhone", e.target.value)} /></label>
          <label className="space-y-2 text-sm md:col-span-2"><span className="font-medium text-brand-navy">Business Hours</span><input className={inputClassName} value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} /></label>
          <label className="space-y-2 text-sm md:col-span-2"><span className="font-medium text-brand-navy">Headquarters Address</span><input className={inputClassName} value={form.headquartersAddress} onChange={(e) => update("headquartersAddress", e.target.value)} /></label>
          <label className="space-y-2 text-sm md:col-span-2"><span className="font-medium text-brand-navy">Business Address</span><input className={inputClassName} value={form.businessAddress} onChange={(e) => update("businessAddress", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Banking Partner</span><input className={inputClassName} value={form.bankingPartner} onChange={(e) => update("bankingPartner", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Website</span><input className={inputClassName} value={form.website} onChange={(e) => update("website", e.target.value)} /></label>
        </div>
      </section>

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Website Hero</h2>
        <div className="grid gap-4">
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Tagline</span><input className={inputClassName} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Hero Title</span><input className={inputClassName} value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Hero Subtitle</span><textarea className={`${inputClassName} min-h-24 py-2`} value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Hero Button Text</span><input className={inputClassName} value={form.heroButtonText} onChange={(e) => update("heroButtonText", e.target.value)} /></label>
          <label className="space-y-2 text-sm"><span className="font-medium text-brand-navy">Hero Background URL</span><input className={inputClassName} value={form.heroBackground} onChange={(e) => update("heroBackground", e.target.value)} /></label>
        </div>
      </section>

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Social Media</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(["facebook", "instagram", "linkedin", "twitter", "tiktok", "youtube", "threads", "telegram", "whatsapp"] as const).map((key) => (
            <label key={key} className="space-y-2 text-sm">
              <span className="font-medium capitalize text-brand-navy">{key}</span>
              <input className={inputClassName} value={form[key]} onChange={(e) => update(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="dashboard-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Company Content</h2>
        <div className="grid gap-4">
          {(["aboutUs", "mission", "vision", "whyChooseUs", "footerText", "copyrightText"] as const).map((key) => (
            <label key={key} className="space-y-2 text-sm">
              <span className="font-medium text-brand-navy">{key.replace(/([A-Z])/g, " $1")}</span>
              <textarea className={`${inputClassName} min-h-24 py-2`} value={form[key]} onChange={(e) => update(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="inline-flex h-11 items-center rounded-xl bg-brand-blue px-6 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50">
          {isPending ? "Saving..." : company ? "Save Company" : "Create Company"}
        </button>
        {company ? (
          <button type="button" disabled={isPending} onClick={toggleStatus} className="inline-flex h-11 items-center rounded-xl border border-brand-border px-6 text-sm font-semibold text-brand-navy">
            {company.companyStatus === "active" ? "Deactivate Company" : "Activate Company"}
          </button>
        ) : null}
        <Link href="/super-admin/companies" className="text-sm font-semibold text-brand-blue">
          Back to companies
        </Link>
      </div>
    </form>
  );
}
