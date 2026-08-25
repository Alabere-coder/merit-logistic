import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const createShipmentSchema = z.object({
  senderName: z.string().min(2),
  senderPhone: z.string().min(7),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(7),
  pickupAddress: z.string().min(5, "Enter a full pickup address"),
  deliveryAddress: z.string().min(5, "Enter a full delivery address"),
  packageType: z.enum(["document", "parcel", "fragile", "electronics", "food", "other"]),
  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
});

export const createDriverSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  vehicleType: z.string().min(2),
  vehiclePlate: z.string().optional(),
  licenseNumber: z.string().min(3),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(7),
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const cardPaymentSchema = z.object({
  cardName: z.string().min(2, "Enter the name on the card"),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{13,19}$/.test(v), "Enter a valid card number"),
  expiry: z
    .string()
    .refine((v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v), "Use MM/YY format")
    .refine((v) => {
      const [mm, yy] = v.split("/").map(Number);
      const expiryDate = new Date(2000 + yy, mm); // first day of month after expiry
      return expiryDate > new Date();
    }, "This card has expired"),
  cvc: z.string().refine((v) => /^\d{3,4}$/.test(v), "Enter a valid CVC"),
});

export const bankTransferSchema = z.object({
  reference: z.string().min(4, "Enter your transfer reference"),
});
