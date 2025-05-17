import { z } from "zod";


export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  confirmPassword: z.string(),
  userType: z.enum(["provider", "seeker"], {
    required_error: "Please select your account type",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const serviceFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  shortDescription: z.string().min(10, {
    message: "Short description must be at least 10 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  pricing: z.string().min(1, {
    message: "Please provide pricing information.",
  }),
  description: z.string().min(50, {
    message: "Detailed description must be at least 50 characters.",
  }),
});

// export const formSchema = z.object({
//   title: z.string().min(3, "Title is required").max(100, "Title is too long"),
//   description: z
//     .string()
//     .min(20, "Description should be at least 20 characters")
//     .max(500, "Description is too long. Max 500 characters at most"),
//   category: z
//     .string()
//     .min(3, "Category should be at least 3 characters")
//     .max(20, "Category is too long. Max 20 characters at most"),
//   link: z
//     .string()
//     .url("Invalid Image URL")
//     .refine(async (url) => {
//       try {
//         const res = await fetch(url, { method: "HEAD" });
//         const contentType = res.headers.get("content-type");
//         return contentType?.startsWith("image/");
//       } catch {
//         return false;
//       }
//     }, "URL must be a valid image"),
//   pitch: z.string().min(10, "Pitch should be at least 10 characters"),
// });

export type Service = z.infer<typeof serviceFormSchema>;