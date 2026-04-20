import * as z from "zod";

export const usernameValidation = z
    .string()
    .min(3, {message: "Username should consists more than 3 characters"})
    .max(20, {message: "Username should not be consists of 20 or more characters"})
    // .regex(/^[a-zA-Z0-9_]+$/)

export const registerSchema = z.object({
    username: usernameValidation,
    email: z.email(),
    password: z.string().min(6, {message: "Password must contain at least 6 characters"})
})