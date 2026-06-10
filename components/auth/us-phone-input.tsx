"use client";

import type { ChangeEvent, ComponentProps } from "react";

import { Input } from "@/components/ui-kit/input";
import {
  formatUSPhoneInput,
  isCompleteUSPhone,
  US_PHONE_PATTERN,
} from "@/lib/auth/input-formatters";
import { cn } from "@/lib/utils";

type USPhoneInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "onChange" | "value" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function USPhoneInput({
  className,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  ...props
}: USPhoneInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUSPhoneInput(event.target.value);
    event.target.value = formatted;
    onValueChange?.(formatted);
  };

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="(555) 555-5555"
      defaultValue={defaultValue}
      value={value}
      onChange={handleChange}
      onBlur={(event) => {
        if (event.target.value && !isCompleteUSPhone(event.target.value)) {
          event.target.setCustomValidity(
            "Enter a valid US phone number: (555) 555-5555",
          );
        } else {
          event.target.setCustomValidity("");
        }
        onBlur?.(event);
      }}
      pattern={US_PHONE_PATTERN.source}
      maxLength={14}
      className={cn(className)}
    />
  );
}
