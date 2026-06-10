export const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;
export const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
export const US_STATE_PATTERN = /^[A-Z]{2}$/;

export function formatUSPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isCompleteUSPhone(value: string): boolean {
  return US_PHONE_PATTERN.test(value);
}

export function formatZipCodeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export type PasswordStrengthLevel = "empty" | "weak" | "strong";

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) {
    return "empty";
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  ) {
    return "strong";
  }

  return "weak";
}

export function getPasswordStrengthLabel(level: PasswordStrengthLevel): string {
  switch (level) {
    case "strong":
      return "Strong — includes unique characters";
    case "weak":
      return "Weak — add uppercase, numbers, and symbols";
    default:
      return "Enter a password to check strength";
  }
}
