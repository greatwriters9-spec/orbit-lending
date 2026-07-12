"use client";

import { useActionState, useEffect, useState } from "react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { UsCityInput } from "@/components/auth/us-city-input";
import { UsStateSelect } from "@/components/auth/us-state-select";
import { USPhoneInput } from "@/components/auth/us-phone-input";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import {
  formatUSPhoneInput,
  formatZipCodeInput,
} from "@/lib/auth/input-formatters";
import {
  completeProfileAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import {
  buildProfileCompletionFields,
  type ProfileCompletionFields,
} from "@/lib/auth/profile-completion-fields";
import {
  readMortgageApplicationDraft,
} from "@/lib/onboarding/draft-storage";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

const inputClassName = cn(
  "h-10 border-brand-border bg-brand-background text-sm",
);

type ProfileCompletionFormProps = {
  defaults: ProfileCompletionFields;
};

export function ProfileCompletionForm({ defaults }: ProfileCompletionFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeProfileAction,
    initialState,
  );
  const [fields, setFields] = useState(() =>
    buildProfileCompletionFields({ existing: defaults }),
  );
  const [onboardingDraftJson, setOnboardingDraftJson] = useState("");

  useEffect(() => {
    const draft = readMortgageApplicationDraft();
    setFields(
      buildProfileCompletionFields({
        existing: defaults,
        draft,
      }),
    );

    if (draft) {
      setOnboardingDraftJson(JSON.stringify(draft));
    }
  }, [defaults]);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage message={state.error} variant="error" />

      {onboardingDraftJson ? (
        <input type="hidden" name="onboardingDraft" value={onboardingDraftJson} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            value={fields.firstName}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            value={fields.lastName}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            required
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Phone number" htmlFor="phone">
        <USPhoneInput
          id="phone"
          name="phone"
          value={formatUSPhoneInput(fields.phone)}
          onValueChange={(phone) =>
            setFields((current) => ({ ...current, phone }))
          }
          required
          className={inputClassName}
        />
      </FormField>

      <FormField label="Date of birth" htmlFor="dateOfBirth">
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={fields.dateOfBirth}
          onChange={(event) =>
            setFields((current) => ({
              ...current,
              dateOfBirth: event.target.value,
            }))
          }
          required
          className={inputClassName}
        />
      </FormField>

      <FormField label="Street address" htmlFor="address">
        <Input
          id="address"
          name="address"
          value={fields.address}
          onChange={(event) =>
            setFields((current) => ({
              ...current,
              address: event.target.value,
            }))
          }
          placeholder="123 Main Street"
          required
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-[0.7fr_1.3fr_0.8fr]">
        <FormField label="State" htmlFor="state">
          <UsStateSelect
            id="state"
            name="state"
            value={fields.state}
            onValueChange={(stateCode) =>
              setFields((current) => ({
                ...current,
                state: stateCode,
                city: "",
              }))
            }
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="City" htmlFor="city">
          <UsCityInput
            id="city"
            name="city"
            stateCode={fields.state}
            value={fields.city}
            onValueChange={(city) =>
              setFields((current) => ({ ...current, city }))
            }
            required
            disabled={!fields.state}
            className={inputClassName}
          />
        </FormField>

        <FormField label="ZIP code" htmlFor="zipCode">
          <Input
            id="zipCode"
            name="zipCode"
            value={fields.zipCode}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                zipCode: formatZipCodeInput(event.target.value),
              }))
            }
            placeholder="94105"
            required
            inputMode="numeric"
            maxLength={10}
            className={inputClassName}
          />
        </FormField>
      </div>

      <input type="hidden" name="country" value={fields.country || "US"} />

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Saving profile..." : "Confirm details"}
      </Button>
    </form>
  );
}
