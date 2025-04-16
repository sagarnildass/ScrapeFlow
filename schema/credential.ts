import { z } from "zod";

export const createCredentialSchema = z.object({
  name: z.string().max(30, { message: "Name must be less than 30 characters" }),
  value: z
    .string()
    .max(500, { message: "Value must be less than 500 characters" }),
});

export type createCredentialSchemaType = z.infer<typeof createCredentialSchema>;
