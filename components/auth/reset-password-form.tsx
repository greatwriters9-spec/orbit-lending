"use client";

import { useActionState } from "react";

import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-mortgage-background";
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
          className={authInputClassName}
        />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={authInputClassName}
        />
      </FormField>

      <Button type="submit" disabled={isPending} className={authButtonClassName}>
        {isPending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
