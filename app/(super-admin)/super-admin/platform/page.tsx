import { redirect } from "next/navigation";

export default function PlatformManagementRedirectPage() {
  redirect("/super-admin/companies");
}
