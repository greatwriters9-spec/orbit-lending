"use client";

import { useActionState } from "react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { forgotPasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
          className="h-10 border-brand-border bg-brand-background"
        />
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Sending link..." : "Send reset link"}
      </Button>
    </form>
  );
}
