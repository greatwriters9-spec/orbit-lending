"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-mortgage-background";
import { FormField, FormMessage } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {redirectParam ? (
        <input type="hidden" name="redirect" value={redirectParam} />
      ) : null}
      <FormMessage message={state.error} variant="error" />
      <FormMessage message={state.success} variant="success" />

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
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          className={authInputClassName}
        />
      </FormField>

      <Button type="submit" disabled={isPending} className={authButtonClassName}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <div className="pt-2 text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-normal text-[#1e4db7] hover:text-[#163b8c]"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}
