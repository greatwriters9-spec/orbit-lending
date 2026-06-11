import { US_STATES } from "@/lib/auth/us-states";
import { cn } from "@/lib/utils";

type UsStateSelectProps = {
  id: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  className?: string;
};

export function UsStateSelect({
  id,
  name,
  defaultValue,
  required,
  className,
}: UsStateSelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className={cn(
        "w-full rounded-lg border border-brand-border bg-brand-background px-3 text-sm text-brand-text",
        className,
      )}
    >
      <option value="" disabled>
        Select state
      </option>
      {US_STATES.map((state) => (
        <option key={state.code} value={state.code}>
          {state.name}
        </option>
      ))}
    </select>
  );
}
