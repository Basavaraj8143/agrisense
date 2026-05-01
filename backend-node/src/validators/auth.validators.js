const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  preferredLanguage: z.enum(["en", "hi", "kn"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
