const { z } = require("zod");

const CATEGORIES = [
  "AI / Machine Learning",
  "EdTech",
  "AgriTech",
  "FinTech",
  "HealthTech",
  "Sustainability",
  "Community",
  "Developer Tools",
  "E-commerce",
  "Other",
];

const email = z
  .string()
  .trim()
  .max(254)
  .email()
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8)
  .max(128)
  .refine((value) => /[A-Za-z]/.test(value), "Password must contain a letter")
  .refine((value) => /\d/.test(value), "Password must contain a digit");

const name = z.string().trim().min(1).max(80);

const analysisText = (defaultValue = "") => z.string().max(2000).default(defaultValue);
const analysisList = z.array(z.string().trim().min(1).max(80)).max(10).default([]);

const aiAnalysisSchema = z.object({
  problem: analysisText(),
  solution: analysisText(),
  targetUsers: analysisText(),
  features: analysisList,
  techStack: analysisList,
  challenges: analysisText(),
  futureImprovements: analysisText(),
});

const ideaFields = {
  title: z.string().trim().min(1, "Title is required").max(120, "Titles are limited to 120 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Add a little more detail — at least 20 characters")
    .max(5000),
  category: z.enum(CATEGORIES, { message: "Pick a category from the list." }),
  targetAudience: z.string().trim().max(120),
  aiAnalysis: aiAnalysisSchema,
};

const signupSchema = z.object({ name, email, password });
const loginSchema = z.object({ email, password: z.string().min(1) });
const updateProfileSchema = z.object({ name });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

const createIdeaSchema = z.object({
  ...ideaFields,
  category: ideaFields.category.default("Other"),
  targetAudience: ideaFields.targetAudience.default("Not specified"),
  aiAnalysis: ideaFields.aiAnalysis.optional(),
});

const updateIdeaSchema = z
  .object({
    title: ideaFields.title.optional(),
    description: ideaFields.description.optional(),
    category: ideaFields.category.optional(),
    targetAudience: ideaFields.targetAudience.optional(),
    aiAnalysis: ideaFields.aiAnalysis.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to update" });

const analyzeSchema = z.object({
  title: ideaFields.title,
  description: ideaFields.description,
  category: z.string().trim().optional(),
  targetAudience: z.string().trim().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"], {
    message: "Role must be either user or admin.",
  }),
});

module.exports = {
  CATEGORIES,
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createIdeaSchema,
  updateIdeaSchema,
  analyzeSchema,
  updateUserRoleSchema,
};
