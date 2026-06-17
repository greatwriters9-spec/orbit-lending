"use client";

import { useActionState } from "react";

import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-mortgage-background";
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
          className={authInputClassName}
        />
      </FormField>

      <Button type="submit" disabled={isPending} className={authButtonClassName}>
        {isPending ? "Sending link..." : "Send reset link"}
      </Button>
    </form>
  );
}
