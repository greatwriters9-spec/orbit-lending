"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { AuthTrustStrip } from "@/components/auth/auth-trust-strip";
import { FormField, FormMessage } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

const inputClassName = cn(
  "h-11 border-brand-border bg-brand-background text-sm shadow-none",
  "transition-colors hover:border-brand-blue/30",
  "focus-visible:border-brand-blue/50 focus-visible:ring-brand-blue/15",
);

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-7">
      <FormMessage message={state.error} variant="error" />
      <FormMessage message={state.success} variant="success" />

      <div className="grid gap-7 sm:grid-cols-3">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="Middle initial (optional)" htmlFor="middleNameInitial">
          <Input
            id="middleNameInitial"
            name="middleNameInitial"
            autoComplete="additional-name"
            placeholder="A"
            maxLength={1}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            required
            className={inputClassName}
          />
        </FormField>
      </div>

      <FormField label="Email address" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={inputClassName}
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a secure password"
          required
          className={inputClassName}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthIndicator password={password} className="mt-3" />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword">
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          required
          className={inputClassName}
        />
      </FormField>

      <div className="space-y-4 pt-1">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full bg-brand-blue text-sm font-semibold text-white shadow-[var(--shadow-sidebar-active)] transition-colors hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>

        <AuthTrustStrip />

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
