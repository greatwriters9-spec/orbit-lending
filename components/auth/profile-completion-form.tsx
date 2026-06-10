"use client";

import { useActionState } from "react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { USPhoneInput } from "@/components/auth/us-phone-input";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatZipCodeInput } from "@/lib/auth/input-formatters";
import {
  completeProfileAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/profile";

const initialState: AuthActionState = {};

const inputClassName = cn(
  "h-10 border-brand-border bg-brand-background text-sm",
);

type ProfileCompletionFormProps = {
  profile: UserProfile | null;
};

export function ProfileCompletionForm({ profile }: ProfileCompletionFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage message={state.error} variant="error" />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            defaultValue={profile?.first_name ?? ""}
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            defaultValue={profile?.last_name ?? ""}
            required
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Phone number" htmlFor="phone">
        <USPhoneInput
          id="phone"
          name="phone"
          defaultValue={profile?.phone ?? ""}
          required
          className={inputClassName}
        />
      </FormField>

      <FormField label="Date of birth" htmlFor="dateOfBirth">
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={profile?.date_of_birth ?? ""}
          required
          className={inputClassName}
        />
      </FormField>

      <FormField label="Street address" htmlFor="address">
        <Input
          id="address"
          name="address"
          defaultValue={profile?.address ?? ""}
          placeholder="123 Main Street"
          required
          className={inputClassName}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-[1.4fr_0.6fr_0.8fr]">
        <FormField label="City" htmlFor="city">
          <Input
            id="city"
            name="city"
            defaultValue={profile?.city ?? ""}
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="State" htmlFor="state">
          <Input
            id="state"
            name="state"
            defaultValue={profile?.state ?? ""}
            placeholder="CA"
            required
            maxLength={2}
            className={cn(inputClassName, "uppercase")}
            onChange={(event) => {
              event.target.value = event.target.value
                .replace(/[^A-Za-z]/g, "")
                .toUpperCase()
                .slice(0, 2);
            }}
          />
        </FormField>

        <FormField label="ZIP code" htmlFor="zipCode">
          <Input
            id="zipCode"
            name="zipCode"
            defaultValue={profile?.zip_code ?? ""}
            placeholder="94105"
            required
            inputMode="numeric"
            maxLength={10}
            className={inputClassName}
            onChange={(event) => {
              event.target.value = formatZipCodeInput(event.target.value);
            }}
          />
        </FormField>
      </div>

      <input type="hidden" name="country" value={profile?.country ?? "US"} />

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Saving profile..." : "Complete profile"}
      </Button>
    </form>
  );
}
