"use client";

import { useState, useTransition } from "react";

import { updateBrandingConfigAction } from "@/lib/admin/branding/actions";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import type { BrandingConfig } from "@/types/branding-config";

type BrandSettingsFormProps = {
  initialSettings: BrandingConfig;
};

export function BrandSettingsForm({ initialSettings }: BrandSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateDepartmentField(
    department: keyof BrandingConfig["departmentDefaults"],
    field: keyof BrandingConfig["departmentDefaults"]["loan_officer"],
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      departmentDefaults: {
        ...current.departmentDefaults,
        [department]: {
          ...current.departmentDefaults[department],
          [field]: value,
        },
      },
    }));
  }

  function saveSettings() {
    startTransition(async () => {
      const result = await updateBrandingConfigAction(settings);
      setFeedback(result.error ?? result.success ?? null);
    });
  }

  return (
    <section className="card-surface space-y-6 p-6">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">Brand & Contact Settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Institution name, phone, office location, and department defaults used in customer
          emails and the public website footer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Institution Name</span>
          <Input
            value={settings.institutionName}
            onChange={(event) => updateField("institutionName", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Tagline</span>
          <Input
            value={settings.tagline}
            onChange={(event) => updateField("tagline", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Support Email</span>
          <Input
            value={settings.supportEmail}
            onChange={(event) => updateField("supportEmail", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Support Phone</span>
          <Input
            value={settings.supportPhone}
            onChange={(event) => updateField("supportPhone", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium text-brand-navy">Office Hours</span>
          <Input
            value={settings.officeHours}
            onChange={(event) => updateField("officeHours", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium text-brand-navy">Street Address</span>
          <Input
            value={settings.addressLine1}
            onChange={(event) => updateField("addressLine1", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium text-brand-navy">Address Line 2</span>
          <Input
            value={settings.addressLine2}
            onChange={(event) => updateField("addressLine2", event.target.value)}
            placeholder="Suite, floor, etc."
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">City</span>
          <Input
            value={settings.city}
            onChange={(event) => updateField("city", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">State</span>
          <Input
            value={settings.state}
            onChange={(event) => updateField("state", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">ZIP Code</span>
          <Input
            value={settings.zipCode}
            onChange={(event) => updateField("zipCode", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Website Domain</span>
          <Input
            value={settings.websiteDomain}
            onChange={(event) => updateField("websiteDomain", event.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium text-brand-navy">Bank Partner Name</span>
          <Input
            value={settings.bankPartnerName}
            onChange={(event) => updateField("bankPartnerName", event.target.value)}
            placeholder="Pathward National Bank"
          />
          <p className="text-xs text-muted-foreground">
            Platform-wide banking partner shown on the site, emails, and footer. Per-client wire
            destination banks are set separately when linking a funding account.
          </p>
        </label>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-brand-navy">Default Department Signatures</h4>
        {(
          Object.entries(settings.departmentDefaults) as Array<
            [keyof BrandingConfig["departmentDefaults"], BrandingConfig["departmentDefaults"]["loan_officer"]]
          >
        ).map(([department, defaults]) => (
          <div
            key={department}
            className="grid gap-3 rounded-xl border border-brand-border p-4 md:grid-cols-3"
          >
            <p className="text-sm font-medium capitalize text-brand-navy md:col-span-3">
              {department.replace(/_/g, " ")}
            </p>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-brand-navy">Default Name</span>
              <Input
                value={defaults.staffName}
                onChange={(event) =>
                  updateDepartmentField(department, "staffName", event.target.value)
                }
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-brand-navy">Default Title</span>
              <Input
                value={defaults.staffTitle}
                onChange={(event) =>
                  updateDepartmentField(department, "staffTitle", event.target.value)
                }
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-brand-navy">Contact Email</span>
              <Input
                value={defaults.contactEmail}
                onChange={(event) =>
                  updateDepartmentField(department, "contactEmail", event.target.value)
                }
              />
            </label>
          </div>
        ))}
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <Button
        type="button"
        disabled={isPending}
        onClick={saveSettings}
        className="h-10 bg-brand-navy text-white hover:bg-brand-navy/90"
      >
        Save Brand & Contact Settings
      </Button>
    </section>
  );
}
