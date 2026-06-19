"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-mortgage-background";
import { FormField, FormMessage } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

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
            className={authInputClassName}
          />
        </FormField>

        <FormField label="Middle initial (optional)" htmlFor="middleNameInitial">
          <Input
            id="middleNameInitial"
            name="middleNameInitial"
            autoComplete="additional-name"
            placeholder="A"
            maxLength={1}
            className={authInputClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            required
            className={authInputClassName}
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
          className={authInputClassName}
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a secure password"
          required
          className={authInputClassName}
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
          className={authInputClassName}
        />
      </FormField>

      <div className="space-y-4 pt-1">
        <Button
          type="submit"
          disabled={isPending}
          className={authButtonClassName}
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-[#64748b]">
          By creating an account, you agree to our{" "}
          <Link
            href="/legal/terms-of-use"
            className="font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy-policy"
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
