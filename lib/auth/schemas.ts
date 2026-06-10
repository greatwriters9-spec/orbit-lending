import { z } from "zod";

import { US_PHONE_PATTERN, US_ZIP_PATTERN } from "@/lib/auth/input-formatters";

export const usPhoneSchema = z
  .string()
  .regex(US_PHONE_PATTERN, "Enter a valid US phone number: (555) 555-5555");

export const zipCodeSchema = z
  .string()
  .regex(US_ZIP_PATTERN, "Enter a valid ZIP code");

export const usStateSchema = z
  .string()
  .trim()
  .length(2, "Use a 2-letter state code")
  .regex(/^[A-Za-z]{2}$/, "Use a valid 2-letter state code")
  .transform((value) => value.toUpperCase());

export const middleNameInitialSchema = z
  .string()
  .trim()
  .max(1, "Use a single initial")
  .regex(/^[A-Za-z]?$/, "Use a single letter")
  .optional()
  .transform((value) => (value ? value.toUpperCase() : undefined));

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    middleNameInitial: middleNameInitialSchema,
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileCompletionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: usPhoneSchema,
  country: z.string().min(2, "Country is required"),
  state: usStateSchema,
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address is required"),
  zipCode: zipCodeSchema,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
