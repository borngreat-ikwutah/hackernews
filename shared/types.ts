import { z } from "zod";

export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
  success: false;
  message: string;
  isFormError?: boolean;
};

export const loginSchema = z.object({
  name: z.string().min(3).max(31),
  password: z.string().min(3).max(255),
  email: z.string().email(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3).max(255),
});
