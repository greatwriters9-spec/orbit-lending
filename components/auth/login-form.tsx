"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthTrustStrip } from "@/components/auth/auth-trust-strip";
import { FormField, FormMessage } from "@/components/auth/form-field";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
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
          className="h-11 border-brand-border bg-[#F8FAFC] text-sm"
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          className="h-11 border-brand-border bg-[#F8FAFC] text-sm"
        />
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand-blue hover:text-brand-blue/80"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full bg-brand-blue text-sm font-semibold text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <AuthTrustStrip />
    </form>
  );
}
