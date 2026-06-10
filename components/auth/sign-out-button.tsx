import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full px-1.5 py-1 text-left text-sm text-brand-danger"
      >
        Sign out
      </button>
    </form>
  );
}
