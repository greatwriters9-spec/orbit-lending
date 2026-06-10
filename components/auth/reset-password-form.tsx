"use client";

import { useActionState } from "react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { resetPasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage message={state.error} variant="error" />

      <FormField label="New password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 border-brand-border bg-brand-background"
        />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 border-brand-border bg-brand-background"
        />
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
