const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  preferredLanguage: z.enum(["en", "hi", "kn"]).optional(),
  phone: z.string().trim().nullable().optional(),
  location: z.string().trim().nullable().optional(),
  farmSizeAcres: z.number().min(0, "Farm size must be at least 0").nullable().optional(),
  defaultSoilType: z.string().trim().nullable().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "New password must include at least one uppercase letter")
    .regex(/[a-z]/, "New password must include at least one lowercase letter")
    .regex(/[0-9]/, "New password must include at least one number"),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
};
