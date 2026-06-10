"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { DropdownMenuItem } from "@/components/ui-kit/dropdown-menu";

export function SignOutMenuItem() {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          void signOutAction();
        });
      }}
    >
      <LogOut className="size-4 text-brand-danger" />
      <span className="text-brand-danger">Sign out</span>
    </DropdownMenuItem>
  );
}
