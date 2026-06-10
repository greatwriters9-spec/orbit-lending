"use client";

import { FormField } from "@/components/auth/form-field";
import { useWizard } from "@/components/loan-application/wizard-context";
import {
  WizardShell,
  WizardStepError,
} from "@/components/loan-application/wizard-shell";
import { Input } from "@/components/ui-kit/input";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-11 border-brand-border bg-brand-background text-sm shadow-none",
  "focus-visible:border-brand-blue/50 focus-visible:ring-brand-blue/15",
);

export function StepPersonalInformation() {
  const { draft, updatePersonalInfo, stepErrors, currentStep } = useWizard();
  const { personalInfo } = draft;

  return (
    <WizardShell
      title="Personal Information"
      description="Confirm your contact and identity details. Information is pre-filled from your profile where available."
    >
      <WizardStepError message={stepErrors[currentStep]} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            value={personalInfo.firstName}
            onChange={(event) =>
              updatePersonalInfo({ firstName: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            value={personalInfo.lastName}
            onChange={(event) =>
              updatePersonalInfo({ lastName: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(event) =>
              updatePersonalInfo({ email: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Phone number" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(event) =>
              updatePersonalInfo({ phone: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Date of birth" htmlFor="dateOfBirth">
          <Input
            id="dateOfBirth"
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(event) =>
              updatePersonalInfo({ dateOfBirth: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Street address" htmlFor="address" className="sm:col-span-2">
          <Input
            id="address"
            value={personalInfo.address}
            onChange={(event) =>
              updatePersonalInfo({ address: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="City" htmlFor="city">
          <Input
            id="city"
            value={personalInfo.city}
            onChange={(event) =>
              updatePersonalInfo({ city: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="State" htmlFor="state">
          <Input
            id="state"
            value={personalInfo.state}
            onChange={(event) =>
              updatePersonalInfo({ state: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Country" htmlFor="country">
          <Input
            id="country"
            value={personalInfo.country}
            onChange={(event) =>
              updatePersonalInfo({ country: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>
      </div>
    </WizardShell>
  );
}
