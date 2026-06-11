"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { UsCityInput } from "@/components/auth/us-city-input";
import { UsStateSelect } from "@/components/auth/us-state-select";
import { USPhoneInput } from "@/components/auth/us-phone-input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui-kit/avatar";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { StatusBadge } from "@/components/ui-kit/status-badge";
import { formatZipCodeInput } from "@/lib/auth/input-formatters";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/profile/actions";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/profile";

const initialState: ProfileActionState = {};

const inputClassName = cn(
  "h-10 border-brand-border bg-brand-background text-sm",
);

type ClientProfilePageProps = {
  profile: UserProfile;
  email: string;
};

export function ClientProfilePage({ profile, email }: ClientProfilePageProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [selectedState, setSelectedState] = useState(profile.state ?? "");
  const [city, setCity] = useState(profile.city ?? "");

  function handleStateChange(nextState: string) {
    setSelectedState(nextState);
    setCity("");
  }
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const displayName = [
    profile.first_name,
    profile.middle_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "U";

  function handleAvatarUpload(file: File) {
    startAvatarTransition(async () => {
      const formData = new FormData();
      formData.set("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        error?: string;
        success?: string;
        avatarUrl?: string;
      };

      setAvatarMessage(result.error ?? result.success ?? null);
      if (result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        router.refresh();
      }
    });
  }

  function handleRemoveAvatar() {
    startAvatarTransition(async () => {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      const result = (await response.json()) as {
        error?: string;
        success?: string;
      };

      setAvatarMessage(result.error ?? result.success ?? null);
      if (result.success) {
        setAvatarUrl(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-primary text-3xl">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal details and profile photo.
        </p>
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="size-24 ring-4 ring-brand-border/50">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
              <AvatarFallback className="bg-brand-navy text-2xl font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-brand-navy">{displayName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status="active" label={profile.profile_status} />
                <StatusBadge status="completed" label={profile.account_status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleAvatarUpload(file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isAvatarPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 size-4" />
              Upload Photo
            </Button>
            {avatarUrl ? (
              <Button
                type="button"
                variant="outline"
                disabled={isAvatarPending}
                onClick={handleRemoveAvatar}
              >
                <Trash2 className="mr-2 size-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {avatarMessage ? (
          <p className="mt-4 text-sm text-muted-foreground">{avatarMessage}</p>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            JPG, PNG, or WebP up to 5 MB.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <h2 className="heading-secondary text-lg">Personal Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your contact and address information.
        </p>

        <form action={formAction} className="mt-6 space-y-5">
          <FormMessage message={state.error} variant="error" />
          <FormMessage message={state.success} variant="success" />

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.first_name ?? ""}
                required
                className={inputClassName}
              />
            </FormField>

            <FormField label="Middle initial" htmlFor="middleName">
              <Input
                id="middleName"
                name="middleName"
                defaultValue={profile.middle_name ?? ""}
                maxLength={1}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.last_name ?? ""}
                required
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email" htmlFor="profile-email">
              <Input id="profile-email" value={email} disabled className={inputClassName} />
            </FormField>

            <FormField label="Phone number" htmlFor="phone">
              <USPhoneInput
                id="phone"
                name="phone"
                defaultValue={profile.phone ?? ""}
                required
                className={inputClassName}
              />
            </FormField>
          </div>

          <FormField label="Date of birth" htmlFor="dateOfBirth">
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={profile.date_of_birth ?? ""}
              required
              className={inputClassName}
            />
          </FormField>

          <FormField label="Street address" htmlFor="address">
            <Input
              id="address"
              name="address"
              defaultValue={profile.address ?? ""}
              required
              className={inputClassName}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="State" htmlFor="state">
              <UsStateSelect
                id="state"
                name="state"
                value={selectedState}
                onValueChange={handleStateChange}
                required
                className={inputClassName}
              />
            </FormField>

            <FormField label="City" htmlFor="city">
              <UsCityInput
                id="city"
                name="city"
                stateCode={selectedState}
                value={city}
                onValueChange={setCity}
                required
                disabled={!selectedState}
                className={inputClassName}
              />
            </FormField>

            <FormField label="ZIP code" htmlFor="zipCode">
              <Input
                id="zipCode"
                name="zipCode"
                defaultValue={profile.zip_code ?? ""}
                required
                onChange={(event) => {
                  event.target.value = formatZipCodeInput(event.target.value);
                }}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Country" htmlFor="country">
              <Input
                id="country"
                name="country"
                defaultValue={profile.country ?? "US"}
                required
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-brand-blue text-white">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
